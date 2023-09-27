const db = require('../../../config/db');
const { hasConflict, hasPending, deleteItem } = require('../../../config/defaultConfig');

class ProdutoController {
    async getList(req, res) {
        const { unidadeID } = req.params
        try {
            const sqlGetList = `
            SELECT 
            a.produtoID AS id,
            a.nome,
            b.nome AS unidadeMedida,
            c.nome as status,
            c.cor
            FROM produto AS a 
            JOIN unidademedida AS b ON (a.unidadeMedidaID = b.unidadeMedidaID)
            JOIN status AS c ON (a.status =  c.statusID)
            WHERE a.unidadeID = ?
            `
            const resultSqlGetList = await db.promise().query(sqlGetList, [unidadeID])
            return res.status(200).json(resultSqlGetList[0])
        } catch (error) {
            console.log(error)
        }
    }

    async getData(req, res) {
        try {
            const { id } = req.params;
            const sqlData = `SELECT * FROM produto WHERE produtoID = ?`
            const [resultData] = await db.promise().query(sqlData, id);

            if (!resultData || resultData.length === 0) return res.status(404).json({ error: "Nenhum dado encontrado." })

            const sqlUnidadeMedida = `
            SELECT 
                pf.nome, 
                pf.unidadeMedidaID AS id
            FROM produto AS gp 
            JOIN unidademedida AS pf ON (gp.unidadeMedidaID  = pf.unidadeMedidaID )
                WHERE gp.produtoID = ?;
            `
            const [resultUnidadeMedida] = await db.promise().query(sqlUnidadeMedida, [id]);

            const sqlAnexos = 'SELECT * FROM produto_anexo WHERE produtoID = ?'

            const [resultAnexos] = await db.promise().query(sqlAnexos, [id]);


            const sqlOptionsUnidadeMedida = `SELECT nome, unidadeMedidaID AS id FROM unidademedida`
            const [resultOptionsUnidadeMedida] = await db.promise().query(sqlOptionsUnidadeMedida);

            const result = {
                fields: resultData[0],
                anexos: resultAnexos,
                unidadeMedida: {
                    fields: resultUnidadeMedida[0],
                    options: resultOptionsUnidadeMedida
                },
            };
            res.status(200).json(result);
        } catch (error) {
            console.error("Erro ao buscar dados no banco de dados: ", error);
            res.status(500).json({ error: "Ocorreu um erro ao buscar os dados no banco de dados." });
        }
    }

    async getNewData(req, res) {
        try {
            const sqlForms = 'SELECT nome, unidadeMedidaID AS id FROM unidademedida'
            const [resultForms] = await db.promise().query(sqlForms)

            const result = {
                fields: {
                    status: true
                },
                anexos: [],
                unidadeMedida: {
                    fields: null,
                    options: resultForms
                },
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

            //* Valida conflito
            const validateConflicts = {
                columns: ['nome', 'unidadeID', 'unidadeMedidaID'],
                values: [values.fields.nome, values.unidadeID, values.unidadeMedida.fields.id],
                table: 'produto',
                id: null
            }
            if (await hasConflict(validateConflicts)) {
                return res.status(409).json({ message: "Dados já cadastrados!" });
            }

            // //? Insere novo item
            const sqlInsert = `INSERT INTO produto (nome, status, unidadeMedidaID, unidadeID) VALUES (?, ?, ?, ?)`
            const [resultInsert] = await db.promise().query(sqlInsert, [values.fields.nome, (values.fields.status ? '1' : '0'), values.unidadeMedida.fields.id, values.unidadeID])
            const id = resultInsert.insertId

            //? Adiciona anexos
            if (values.anexos.length > 0) {
                const sqlInsertAnexo = 'INSERT INTO produto_anexo (nome, descricao, obrigatorio, status, produtoID) VALUES (?, ?, ?, ?, ?)'
                values.anexos.map(async (item) => {
                    const [resultInsertAnexo] = await db.promise().query(sqlInsertAnexo, [item.nome, item.descricao, item.obrigatorio ? '1' : '0', item.status ? '1' : '0', id])
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

            //* Valida conflito
            const validateConflicts = {
                columns: ['produtoID', 'nome', 'unidadeID', 'unidadeMedidaID'],
                values: [id, values.fields.nome, values.unidadeID, values.unidadeMedida.fields.id],
                table: 'produto',
                id: id
            }
            if (await hasConflict(validateConflicts)) {
                return res.status(409).json({ message: "Dados já cadastrados!" });
            }

            //? Atualiza produto
            const sqlUpdate = `UPDATE produto SET nome = ?, unidadeMedidaID = ?, status = ? WHERE produtoID = ?`;
            const [resultUpdate] = await db.promise().query(sqlUpdate, [values.fields.nome, values.unidadeMedida.fields.id, (values.fields.status ? '1' : '0'), id]);


            //? Insere ou atualiza anexos
            if (values.anexos.length > 0) {
                values.anexos.map(async (item) => {
                    if (item && item.produtoAnexoID > 0) { //? Já existe, atualiza
                        const sqlUpdateItem = `UPDATE produto_anexo SET nome = ?, descricao = ?, status = ?, obrigatorio = ? WHERE produtoAnexoID = ?`
                        const [resultUpdateItem] = await db.promise().query(sqlUpdateItem, [item.nome, item.descricao, (item.status ? '1' : '0'), (item.obrigatorio ? '1' : '0'), item.produtoAnexoID])
                    } else if (item && !item.produtoAnexoID) {                   //? Novo, insere
                        const sqlInsertItem = `INSERT INTO produto_anexo (nome, descricao, produtoID, status, obrigatorio) VALUES (?, ?, ?, ?, ?)`
                        const [resultInsertItem] = await db.promise().query(sqlInsertItem, [item.nome, item.descricao, id, (item.status ? '1' : '0'), (item.obrigatorio ? '1' : '0')])
                    }
                })
            }


            if (values.removedItems.length > 0) {
                const sqlDeleteAnexos = `DELETE FROM produto_anexo WHERE produtoAnexoID IN (${values.removedItems.join(',')})`
                const [resultDeleteAnexos] = await db.promise().query(sqlDeleteAnexos)

            }

            return res.status(200).json({ message: 'Dados atualizados com sucesso!' })
        } catch (error) {
            console.log(error)
        }
    }

    deleteData(req, res) {
        const { id } = req.params
        const objModule = {
            table: ['produto', 'produto_anexo'],
            column: 'produtoID'
        }
        const tablesPending = [] // Tabelas que possuem relacionamento com a tabela atual

        if (!tablesPending || tablesPending.length === 0) {
            return deleteItem(id, objModule.table, objModule.column, res)
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
                res.status(500).json(err);
            });
    }

}

module.exports = ProdutoController;