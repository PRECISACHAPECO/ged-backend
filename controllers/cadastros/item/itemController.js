const db = require('../../../config/db');
const { hasConflict, hasPending, deleteItem } = require('../../../config/defaultConfig');

class ItemController {
    async getList(req, res) {
        try {
            const sqlGetList = `
            SELECT 
                itemID AS id, 
                a.nome, 
                a.status, 
            b.nome AS formulario 
            FROM item AS a 
            LEFT JOIN par_formulario b ON (a.parFormularioID = b.parFormularioID) 
            ORDER BY b.parFormularioID ASC, a.itemID ASC`
            const resultSqlGetList = await db.promise().query(sqlGetList)
            return res.status(200).json(resultSqlGetList[0])
        } catch (error) {
            console.log(error)
        }
    }

    async getData(req, res) {
        try {
            const { id } = req.params;
            const sqlData = `SELECT * FROM item WHERE itemID = ?`
            const [resultData] = await db.promise().query(sqlData, id);

            if (!resultData || resultData.length === 0) return res.status(404).json({ error: "Nenhum dado encontrado." })

            const sqlFormulario = `
            SELECT pf.nome, pf.parFormularioID AS id
            FROM item AS gp 
                JOIN par_formulario AS pf ON (gp.parFormularioID = pf.parFormularioID)
            WHERE gp.itemID = ?`
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
                    fields: resultFormulario[0],
                    options: resultOptionsFormulario
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
            const sqlForms = 'SELECT parFormularioID AS id, nome FROM par_formulario'
            const [resultForms] = await db.promise().query(sqlForms)

            const result = {
                fields: {
                    status: true
                },
                formulario: {
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
                columns: ['nome', 'parFormularioID'],
                values: [values.fields.nome, values.formulario.fields.id],
                table: 'item',
                id: null
            }
            if (await hasConflict(validateConflicts)) {
                return res.status(409).json({ message: "Dados já cadastrados!" });
            }

            // //? Insere novo item
            const sqlInsert = `INSERT INTO item (nome, status, parFormularioID) VALUES (?, ?, ?)`
            const [resultInsert] = await db.promise().query(sqlInsert, [values.fields.nome, (values.fields.status ? '1' : '0'), values.formulario.fields.id])
            const id = resultInsert.insertId

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
                columns: ['itemID', 'nome', 'parFormularioID'],
                values: [id, values.fields.nome, values.formulario.fields.id],
                table: 'item',
                id: id
            }
            if (await hasConflict(validateConflicts)) {
                return res.status(409).json({ message: "Dados já cadastrados!" });
            }

            //? Atualiza item
            console.log("🚀 ~ values:", values)
            console.log("🚀 ~ id:", id)
            const sqlUpdate = `UPDATE item SET nome = ?, parFormularioID = ?,  status = ? WHERE itemID = ?`;
            const [resultUpdate] = await db.promise().query(sqlUpdate, [values.fields.nome, values.formulario.fields.id, (values.fields.status ? '1' : '0'), id]);

            return res.status(200).json({ message: 'Dados atualizados com sucesso!' })
        } catch (error) {
            console.log(error)
        }
    }

    deleteData(req, res) {
        const { id } = req.params
        const objModule = {
            table: ['item'],
            column: 'itemID'
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

module.exports = ItemController;