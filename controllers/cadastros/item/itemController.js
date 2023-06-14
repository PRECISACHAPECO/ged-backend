const db = require('../../../config/db');
const { hasPending, deleteItem } = require('../../../config/defaultConfig');

class ItemController {
    getList(req, res) {
        db.query("SELECT itemID AS id, a.nome, a.status, b.nome AS formulario FROM item AS a LEFT JOIN par_formulario b ON (a.parFormularioID = b.parFormularioID) ORDER BY b.parFormularioID ASC, a.itemID ASC", (err, result) => {
            if (err) {
                res.status(502).json(err);
            } else {
                res.status(200).json(result);
            }
        })
    }

    async getData(req, res) {
        const functionName = req.headers['function-name'];
        console.log("função", functionName)

        switch (functionName) {

            case 'getData':
                console.log("get data")

                try {
                    const [resultData] = await db.promise().query("SELECT * FROM item WHERE itemID = ?", [req.params.id]);

                    if (!resultData || resultData.length === 0) {
                        return res.status(404).json({ error: "Nenhum dado encontrado." });
                    }

                    const [resultFormularios] = await db.promise().query("SELECT * FROM par_formulario");

                    const resultTipoFormulario = resultFormularios.find((row) => {
                        return row.parFormularioID === resultData[0].parFormularioID;
                    });

                    const objData = {
                        value: resultData[0],
                        formularios: resultFormularios,
                        tipoFormulario: resultTipoFormulario,
                    };

                    res.status(200).json(objData);
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

        db.query("SELECT * FROM item", (err, result) => {
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
                    db.query("INSERT INTO item (nome, status, parFormularioID) VALUES (?, ?, ?)", [nome, status, tipoFormularioID], (err, result) => {
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

    updateData(req, res) {
        const { id } = req.params
        const { nome, status, tipoFormularioID } = req.body

        console.log(nome, status, tipoFormularioID)
        db.query("SELECT * FROM item", (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json(err);
            } else {
                // Verifica se já existe um registro com o mesmo nome e id diferente
                const rows = result.find(row => row.nome == nome && row.itemID != id);
                if (rows) {
                    res.status(409).json({ message: "Dados já cadastrados!" });
                } else {
                    // Passou na validação, atualiza os dados
                    // fazer update com left join com par_formulario
                    db.query("UPDATE item SET nome = ?, status = ?" + (tipoFormularioID ? ", parFormularioID = ?" : "") + " WHERE itemID = ?", [nome, status].concat(tipoFormularioID ? [tipoFormularioID] : [], [id]), (err, result) => {
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