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
        const functionName = req.headers['function-name'];
        console.log("função", functionName)

        switch (functionName) {

            case 'getData':

                const id = req.params.id

                if (!id || id == 'undefined') {
                    return res.status(404).json({ error: "Nenhum dado encontrado." });
                }

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

                    // const resultTipoFormulario = resultFormularios.find((row) => {
                    //     return row.parFormularioID === resultData[0].parFormularioID;
                    // });

                    const requisitosSql = `SELECT * FROM  grupoanexo_item WHERE grupoanexoID = ?`
                    const [resultRequisitos] = await db.promise().query(requisitosSql, [req.params.id]);

                    // const requisitos = resultRequisitos

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

                break

            case 'getNovo':
                console.log("get novo")

                const [resultFormularios] = await db.promise().query("SELECT * FROM par_formulario");

                const objData = {
                    value: null,
                    formularios: resultFormularios,
                    tipoFormulario: null,
                };

                res.status(200).json(objData);

                break
        }
    }

    insertData(req, res) {
        const { nome, status, tipoFormularioID } = req.body

        db.query("SELECT * FROM requisitoanexo", (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json(err);
            } else {
                // Verifica se já existe um registro com o mesmo nome
                const rows = result.find(row => row.nome == nome);
                if (rows) {
                    res.status(409).json({ message: "Dados já cadastrados!" });
                } else {
                    // Passou na validação, insere os dados
                    db.query("INSERT INTO requisitoanexo (nome, status, parFormularioID) VALUES (?, ?, ?)", [nome, status, tipoFormularioID], (err, result) => {
                        if (err) {
                            console.log(err);
                            res.status(500).json(err);
                        } else {
                            res.status(200).json(result);
                        }
                    });
                }
            }
        })
    }

    async updateData(req, res) {
        const { id } = req.params
        const newData = req.body.newData
        console.log("🚀 ~ newData:", newData)


        try {
            const sqlExistItem = `SELECT * FROM grupoanexo WHERE grupoanexoID = ?`;
            const [resultSqlExistItem] = await db.promise().query(sqlExistItem, [id]);
            if (resultSqlExistItem) {



                const sqlUpdateGrupoAnexo = `UPDATE grupoanexo SET nome = ? ,descricao = ? ,parFormularioID = ? ,status = ? WHERE grupoanexoID = ?`;
                const [resultSqlUpdateGrupoAnexo] = await db.promise().query(sqlUpdateGrupoAnexo, [newData.nome, newData.descricao, newData.formulario.id, newData.status, id]);

                const sqlUpdateItem = `UPDATE grupoanexo_item SET nome = ? ,descricao = ? ,grupoanexoID = ? ,status = ?, obrigatorio = ? WHERE grupoanexoitemID = ?`



                newData.requisitos.map(async (item) => {
                    // if
                    const [resultsqlUpdateItem] = await db.promise().query(sqlUpdateItem, [
                        item.nome,
                        item.descricao,
                        id,
                        item.statusRequisito ? 1 : 0,
                        item.obrigatorio ? 1 : 0,
                        item.grupoanexoitemID
                    ]);
                    console.log(resultsqlUpdateItem);
                });




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
            table: 'requisitoanexo',
            column: 'requisitoanexoID'
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

module.exports = GrupoAnexosController;