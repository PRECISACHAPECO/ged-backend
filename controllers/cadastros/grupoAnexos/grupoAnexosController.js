const db = require('../../../config/db');
const { hasPending, deleteItem } = require('../../../config/defaultConfig');

class GrupoAnexosController {
    async getList(req, res) {
        try {

            const { unidadeID } = req.body

            if (!unidadeID) {
                return res.status(400).json({ message: "Dados inválidos!" });
            }

            const sqlGetGrupoAnexos = `
            SELECT 
                grupoanexoID AS id, 
                a.nome, 
                e.nome AS status,
                e.cor,
                a.descricao
            FROM grupoanexo AS a 
                LEFT JOIN status AS e ON (a.status = e.statusID)
            WHERE a.unidadeID = ?
            ORDER BY a.nome ASC
            `
            const [resultSqlGetGrupoAnexos] = await db.promise().query(sqlGetGrupoAnexos, [unidadeID]);
            return res.status(200).json(resultSqlGetGrupoAnexos)
        }
        catch (err) {
            return res.json(err);
        }
    }

    async getData(req, res) {
        try {
            const { id } = req.params

            const sqlData = `
            SELECT a.grupoanexoID AS id, a.nome, a.descricao, a.status
            FROM grupoanexo AS a 
            WHERE a.grupoanexoID = ?`
            const [resultData] = await db.promise().query(sqlData, [id]);

            if (!resultData || resultData.length === 0) return res.status(404).json({ error: "Nenhum dado encontrado." })

            const sqlFormulario = `
            SELECT pf.nome, pf.parFormularioID AS id
            FROM grupoanexo_parformulario AS gp 
                JOIN par_formulario AS pf ON (gp.parFormularioID = pf.parFormularioID)
            WHERE gp.grupoAnexoID = ?`
            const [resultFormulario] = await db.promise().query(sqlFormulario, [id]);

            const sqlOptionsFormulario = `SELECT nome, parFormularioID AS id FROM par_formulario`
            const [resultOptionsFormulario] = await db.promise().query(sqlOptionsFormulario);

            const sqlItens = `
            SELECT grupoanexoitemID AS id, nome, descricao, obrigatorio, status,
                (SELECT IF(COUNT(*) > 0, 1, 0)
                FROM anexo AS a 
                WHERE a.grupoAnexoItemID = grupoanexo_item.grupoanexoitemID) AS hasPending
            FROM grupoanexo_item 
            WHERE grupoanexoID = ?`
            const [resultItens] = await db.promise().query(sqlItens, [id]);

            const result = {
                fields: resultData[0],
                formulario: {
                    fields: resultFormulario,
                    options: resultOptionsFormulario
                },
                items: resultItens
            }

            res.status(200).json(result);
        } catch (error) {
            console.error("Erro ao buscar dados no banco de dados: ", error);
            res.status(500).json({ error: "Ocorreu um erro ao buscar os dados no banco de dados." });
        }
    }

    async getNewData(req, res) {
        try {
            const sqlForms = 'SELECT parFormularioID AS id, nome FROM par_formulario'
            const [resultForms] = await db.promise().query(sqlForms)

            const result = {
                fields: {
                    status: true
                },
                formulario: {
                    fields: [],
                    options: resultForms
                },
                items: [{
                    status: true,
                    obrigatorio: true
                }]
            }

            res.status(200).json(result);
        } catch (error) {
            console.error("Erro ao buscar dados no banco de dados: ", error);
            res.json({ error: "Ocorreu um erro ao buscar os dados no banco de dados." });
        }
    }

    async insertData(req, res) {
        try {
            const values = req.body

            //? Atualiza grupo_anexo 
            const sqlInsert = `INSERT INTO grupoanexo (nome, descricao, unidadeID, status) VALUES (?, ?, ?, ?)`
            const [resultInsert] = await db.promise().query(sqlInsert, [values.fields.nome, values.fields.descricao, values.unidade, (values.fields.status ? '1' : '0')])
            const id = resultInsert.insertId

            //? Atualizado formulários (+1)
            if (values.formulario.fields.length > 0) {
                const sqlInsertFormularios = `INSERT INTO grupoanexo_parformulario (grupoAnexoID, parFormularioID) VALUES (?, ?)`
                values.formulario.fields.map(async (item) => {
                    const [resultInsertFormularios] = await db.promise().query(sqlInsertFormularios, [id, item.id]);
                })
            }

            //? Itens do grupo de anexos
            if (values.items.length > 0) {
                values.items.map(async (item) => {
                    const sqlInsertItem = `INSERT INTO grupoanexo_item (nome, descricao, grupoanexoID, status, obrigatorio) VALUES (?, ?, ?, ?, ?)`
                    const [resultInsertItem] = await db.promise().query(sqlInsertItem, [item.nome, item.descricao, id, (item.status ? '1' : '0'), (item.obrigatorio ? '1' : '0')])
                })
            }

            return res.status(200).json(id)
        } catch (error) {
            console.log(error)
        }
    }

    async updateData(req, res) {
        try {
            const { id } = req.params
            const values = req.body

            if (!id || id == undefined) return res.status(400).json({ message: "ID não informado" })

            //? Atualiza grupo_anexo 
            const sqlUpdate = `UPDATE grupoanexo SET nome = ?, descricao = ?, status = ? WHERE grupoanexoID = ?`;
            const [resultUpdate] = await db.promise().query(sqlUpdate, [values.fields.nome, values.fields.descricao, (values.fields.status ? '1' : '0'), id]);

            //? Atualizado formulários (+1)
            // Remove atuais 
            const sqlDeleteFormularios = `DELETE FROM grupoanexo_parformulario WHERE grupoAnexoID = ?`
            const [resultDeleteFormularios] = await db.promise().query(sqlDeleteFormularios, [id]);
            // Insere novos 
            if (values.formulario.fields.length > 0) {
                const sqlInsertFormularios = `INSERT INTO grupoanexo_parformulario (grupoAnexoID, parFormularioID) VALUES (?, ?)`
                values.formulario.fields.map(async (item) => {
                    const [resultInsertFormularios] = await db.promise().query(sqlInsertFormularios, [id, item.id]);
                })
            }

            //? Itens do grupo de anexos
            if (values.removedItems.length > 0) {
                //? Valida se há pendências
                const sqlPending = `SELECT * FROM anexo WHERE grupoAnexoItemID IN (${values.removedItems.join(',')})`
                const [resultPending] = await db.promise().query(sqlPending)
                if (resultPending.length > 0) {
                    resultPending.map((item, index) => {
                        const indexItem = values.removedItems.indexOf(item.grupoAnexoItemID)
                        if (indexItem > -1) { values.removedItems.splice(indexItem, 1) }
                    })
                }
                //? Remove somente itens que não possuem pendências
                const sqlDeleteItens = `DELETE FROM grupoanexo_item WHERE grupoanexoitemID IN (${values.removedItems.join(',')})`
                const [resultDeleteItens] = await db.promise().query(sqlDeleteItens)
            }

            if (values.items.length > 0) {
                values.items.map(async (item) => {
                    if (item && item.id > 0) { //? Já existe, atualiza
                        const sqlUpdateItem = `UPDATE grupoanexo_item SET nome = ?, descricao = ?, status = ?, obrigatorio = ? WHERE grupoanexoitemID = ?`
                        const [resultUpdateItem] = await db.promise().query(sqlUpdateItem, [item.nome, item.descricao, (item.status ? '1' : '0'), (item.obrigatorio ? '1' : '0'), item.id])
                    } else if (item && !item.id) {                   //? Novo, insere
                        const sqlInsertItem = `INSERT INTO grupoanexo_item (nome, descricao, grupoanexoID, status, obrigatorio) VALUES (?, ?, ?, ?, ?)`
                        const [resultInsertItem] = await db.promise().query(sqlInsertItem, [item.nome, item.descricao, id, (item.status ? '1' : '0'), (item.obrigatorio ? '1' : '0')])
                    }
                })
            }

            return res.status(200).json({ message: 'Dados atualizados com sucesso!' })
        } catch (error) {
            console.log(error)
        }
    }

    async deleteData(req, res) {
        const { id } = req.params;

        const tablesPending = ['anexo', 'fabrica_fornecedor_grupoanexo', 'grupoanexo_item', 'grupoanexo_parformulario']; // Tabelas que possuem relacionamento com a tabela atual
        // Tabelas que quero deletar
        const objModule = {
            table: ['grupoanexo', 'grupoanexo_item'],
            column: 'grupoanexoID'
        };

        //? obtém itens do grupo
        const sqlItems = `SELECT * FROM grupoanexo_item WHERE grupoanexoID = ?`
        const [resultItems] = await db.promise().query(sqlItems, [id])

        let canDelete = true; // Se não houver nenhuma pendência nos itens do grupo, pode apagar o grupo
        if (tablesPending.length > 0) {
            for (const item of resultItems) {
                if (item.grupoanexoitemID) {
                    const sqlPending = `SELECT * FROM anexo WHERE grupoAnexoItemID = ?`
                    const [resultPending] = await db.promise().query(sqlPending, [item.grupoanexoitemID])
                    if (resultPending.length > 0) {
                        canDelete = false;
                        break; // Encerrar o laço
                    }
                }
            }
        }

        //? Nenhum item tem pendência com os anexos, pode deletar
        if (canDelete) {
            return deleteItem(id, objModule.table, objModule.column, res);
        } else {
            return res.status(409).json({ message: "Dado possui pendência." });
        }
    }
}

module.exports = GrupoAnexosController;