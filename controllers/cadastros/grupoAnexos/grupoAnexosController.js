const db = require('../../../config/db');
const { hasPending, deleteItem } = require('../../../config/defaultConfig');

class GrupoAnexosController {
    async getList(req, res) {
        try {
            const sqlGetGrupoAnexos = `
            SELECT grupoanexoID AS id, a.nome, a.status, a.descricao
            FROM grupoanexo AS a 
            ORDER BY a.nome ASC`
            const [resultSqlGetGrupoAnexos] = await db.promise().query(sqlGetGrupoAnexos);
            return res.status(200).json(resultSqlGetGrupoAnexos)
            console.log(resultSqlGetGrupoAnexos)
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
            SELECT pf.parFormularioID AS id, pf.nome
            FROM grupoanexo_parformulario AS gp 
                JOIN par_formulario AS pf ON (gp.parFormularioID = pf.parFormularioID)
            WHERE gp.grupoAnexoID = ?`
            const [resultFormulario] = await db.promise().query(sqlFormulario, [id]);

            const sqlOptionsFormulario = `SELECT parFormularioID AS id, nome FROM par_formulario`
            const [resultOptionsFormulario] = await db.promise().query(sqlOptionsFormulario);

            const sqlItens = `SELECT grupoanexoitemID AS id, nome, descricao, obrigatorio, status FROM grupoanexo_item WHERE grupoanexoID = ?`
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

    async getDataNew(req, res) {

        try {
            let result = {}
            const sqlGetFormularios = 'SELECT parFormularioID AS id, nome FROM par_formulario'
            const [resultGetFormularios] = await db.promise().query(sqlGetFormularios)
            console.log("🚀 ~ resultGetFormularios:", resultGetFormularios)
            result = {
                formulariosOptions: resultGetFormularios
            }
            res.status(200).json(result);
        } catch (error) {
            console.error("Erro ao buscar dados no banco de dados: ", error);
            res.status(500).json({ error: "Ocorreu um erro ao buscar os dados no banco de dados." });
        }
    }

    async insertData(req, res) {
        const newData = req.body.newData
        console.log("🚀 ~ newData:", newData)
        const unidadeID = newData.unidade
        // console.log("🚀 ~ unidadeID:", unidadeID)


        // const sqlInsertData = `INSERT INTO grupoanexo (nome, descricao, parFormularioID, unidadeID, status) VALUES (?, ?, ?, ?, ?)`
        // const [resultSqlExistsItem] = await db.promise().query(sqlInsertData, [newData.nome, newData.descricao, unidadeID, newData.status == true ? 1 : 0]);
        // console.log("🚀 ~ sqlInsertData:", sqlInsertData)
        // console.log("🚀 ~ resultSqlExistsItem:", resultSqlExistsItem)
        // const idGroup = resultSqlExistsItem.insertId

        // //? Insere os dados dos itens do grupo
        // if (newData.requisitos.length > 0) {
        //     const sqlInsertItem = `INSERT INTO grupoanexo_item (nome, descricao, grupoanexoID, status, obrigatorio) VALUES (?, ?, ?, ?, ?);`
        //     newData.requisitos.map(async (item) => {
        //         const [resultInsertItem] = await db.promise().query(sqlInsertItem, [item.nome, item.descricao, idGroup, item.statusRequisito == true ? 1 : 0, item.obrigatorio == true ? 1 : 0]);
        //     })
        // }
        // res.status(200).json({ message: "Dados gravados com sucesso" })


    }

    async updateData(req, res) {
        try {
            const { id } = req.params
            const values = req.body
            console.log("🚀 ~ values:", values)

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
            // Apaga array de itens 
            if (values.removedItems.length > 0) {
                const sqlDeleteItens = `DELETE FROM grupoanexo_item WHERE grupoanexoitemID IN (${values.removedItems.join(',')})`
                const [resultDeleteItens] = await db.promise().query(sqlDeleteItens)
            }
            // Varre array de itens
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
        const { id } = req.params
        const objModule = {
            table: ['grupoanexo', 'grupoanexo_item'],
            column: 'grupoanexoID'
        }
        const tablesPending = [] // Tabelas que possuem relacionamento com a tabela atual

        if (!tablesPending || tablesPending.length === 0) {
            console.log("entrou ")
            return await deleteItem(id, objModule.table, objModule.column, res)
        }

        hasPending(id, objModule.column, tablesPending)
            .then((hasPending) => {
                if (hasPending) {
                    res.status(409).json({ message: "Dado possui pendência." });
                } else {
                    return deleteItem(id, objModule.table, objModule.column, res)
                }
            })
            .catch((err) => {
                console.log(err);
                res.json(err);
            });
    }

}

module.exports = GrupoAnexosController;