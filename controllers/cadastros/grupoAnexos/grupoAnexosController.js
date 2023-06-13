const db = require('../../../config/db');
const { hasPending, deleteItem } = require('../../../config/defaultConfig');

class GrupoAnexosController {
    async getList(req, res) {
        try {
            const sqlGetGrupoAnexos = `SELECT grupoanexoID AS id, a.nome, a.status, a.descricao, b.nome AS formulario FROM grupoanexo AS a LEFT JOIN par_formulario b ON (a.parFormularioID = b.parFormularioID) ORDER BY b.parFormularioID ASC, a.nome ASC`
            const [resultSqlGetGrupoAnexos] = await db.promise().query(sqlGetGrupoAnexos);
            return res.status(200).json(resultSqlGetGrupoAnexos)
            console.log(resultSqlGetGrupoAnexos)
        }
        catch (err) {
            return res.status(500).json(err);
        }
    }

    async getData(req, res) {
        const id = req.params.id
        try {
            const sqlData = `
                    SELECT a.grupoanexoID AS id, a.nome, a.descricao, a.status, b.parFormularioID, b.nome AS formulario
                    FROM grupoanexo AS a 
                        JOIN par_formulario AS b ON (a.parFormularioID = b.parFormularioID)
                    WHERE a.grupoanexoID = ?`
            const [resultData] = await db.promise().query(sqlData, [id]);

            if (!resultData || resultData.length === 0) {
                return res.status(404).json({ error: "Nenhum dado encontrado." });
            }

            const [resultOptionsFormulario] = await db.promise().query("SELECT  *, par_formulario.parFormularioID AS id FROM par_formulario");

            const requisitosSql = `SELECT * FROM  grupoanexo_item WHERE grupoanexoID = ?`
            const [resultRequisitos] = await db.promise().query(requisitosSql, [req.params.id]);

            const objForm = {
                id: resultData[0].parFormularioID,
                nome: resultData[0].formulario,
                options: resultOptionsFormulario
            }

            const result = resultData[0]
            result.formulario = objForm
            result.requisitos = resultRequisitos

            res.status(200).json(result);
        } catch (error) {
            console.error("Erro ao buscar dados no banco de dados: ", error);
            res.status(500).json({ error: "Ocorreu um erro ao buscar os dados no banco de dados." });
        }
    }

    async getDataNew(req, res, next) {

        try {
            const [resultOptionsFormulario] = await db.promise().query("SELECT  *, par_formulario.parFormularioID AS id FROM par_formulario");

            const objForm = {
                id: null,
                nome: null,
                options: resultOptionsFormulario
            }

            const result = {}
            result.formulario = objForm
            result.requisitos = []

            res.status(200).json(result);
        } catch (error) {
            console.error("Erro ao buscar dados no banco de dados: ", error);
            res.status(500).json({ error: "Ocorreu um erro ao buscar os dados no banco de dados." });
        }
    }

    async insertData(req, res) {
        const newData = req.body.newData

        try {
            //? Insere os dados do grupo
            const sqlInsertData = `INSERT INTO grupoanexo (nome, descricao, parFormularioID, status) VALUES (?, ?, ?, ?)`
            const [resultSqlExistsItem] = await db.promise().query(sqlInsertData, [newData.nome, newData.descricao, newData.formulario.parFormularioID, newData.status == true ? 1 : 0]);
            const idGroup = resultSqlExistsItem.insertId

            // //? Insere os dados dos itens do grupo
            if (newData.requisitos.length > 0) {
                const sqlInsertItem = `INSERT INTO grupoanexo_item (nome, descricao, grupoanexoID, status, obrigatorio) VALUES (?, ?, ?, ?, ?);`
                newData.requisitos.map(async (item) => {
                    const [resultInsertItem] = await db.promise().query(sqlInsertItem, [item.nome, item.descricao, idGroup, item.statusRequisito == true ? 1 : 0, item.obrigatorio == true ? 1 : 0]);
                })
            }
            res.status(200).json({ message: "Dados gravados com sucesso" })
        } catch (error) {
            res.status(500).json({ error: "Ocorreu um erro ao buscar os dados no banco de dados." });
        }

    }


    //! Atualiza os dados no banco de dados
    async updateData(req, res) {
        const { id } = req.params
        const newData = req.body.newData
        console.log("🚀 ~ newData:", newData)

        const sqlExistItem = `SELECT * FROM grupoanexo WHERE grupoanexoID = ?`;
        const [resultSqlExistItem] = await db.promise().query(sqlExistItem, [id]);
        try {
            if (resultSqlExistItem) {
                //? Verifica se grupoanexo existe no banco
                //? Faz update no grupoanexo
                const sqlUpdateGrupoAnexo = `UPDATE grupoanexo SET nome = ? ,descricao = ? ,parFormularioID = ? ,status = ? WHERE grupoanexoID = ?`;
                const [resultSqlUpdateGrupoAnexo] = await db.promise().query(sqlUpdateGrupoAnexo, [newData.nome, newData.descricao, newData.formulario.id, newData.status, id]);
                //? Faz update no item do grupo de anexos
                const sqlUpdateItem = `UPDATE grupoanexo_item SET nome = ? ,descricao = ? ,grupoanexoID = ? ,status = ?, obrigatorio = ? WHERE grupoanexoitemID = ?`
                //? Insere novo tem no grupo de anexos
                const sqlInsertItem = `INSERT INTO grupoanexo_item (nome, descricao, grupoanexoID, status, obrigatorio) VALUES (?, ?, ?, ?, ?);`
                //? Remove item do grupo de anexos
                const sqlDeleteItem = `DELETE FROM grupoanexo_item WHERE grupoanexoitemID = ?`

                //? Verifica se um novo item ou um item já existente
                newData.requisitos.map(async (item) => {
                    if (item.grupoanexoitemID > 0) {
                        const [resultsqlUpdateItem] = await db.promise().query(sqlUpdateItem, [
                            item.nome,
                            item.descricao,
                            id,
                            item.statusRequisito ? 1 : 0,
                            item.obrigatorio ? 1 : 0,
                            item.grupoanexoitemID
                        ]);
                    } else {
                        const [resultsqlInsertItem] = await db.promise().query(sqlInsertItem, [
                            item.nome,
                            item.descricao,
                            id,
                            item.statusRequisito ? 1 : 0,
                            item.obrigatorio ? 1 : 0
                        ]);
                    }
                });
                //! Verifica se existem itens para ser removidos
                if (newData.removedItems.length == 0) return res.status(200).json({ message: 'Dados atualizados com sucesso!' })
                newData.removedItems.map(async (item) => {
                    const [resultsqlDeleteItem] = await db.promise().query(sqlDeleteItem, item)
                })

                return res.status(200).json({ message: 'Dados atualizados com sucesso!' })
            } else {
                return res.status(401).json({ message: "Item não encontrado" });
            }

        } catch (error) {
            console.log(error)
        }
    }

    deleteData(req, res) {
        const { id } = req.params
        const objModule = {
            table: ['grupoanexo', 'grupoanexo_item'],
            column: 'grupoanexoID '
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
                res.json(err);
            });
    }

}

module.exports = GrupoAnexosController;