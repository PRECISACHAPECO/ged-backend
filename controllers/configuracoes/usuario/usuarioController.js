const db = require('../../../config/db');
const { hasPending, deleteItem } = require('../../../config/defaultConfig');

class UsuarioController {
    getList(req, res) {

        db.query("SELECT usuarioID AS id, nome, status FROM usuario", (err, result) => {
            if (err) {
                res.status(500).json(err);
            } else {
                res.status(200).json(result);
            }
        })
    }

    async getData(req, res) {
        const { id } = req.params
        const { admin } = req.query
        const { unidadeID } = req.query
        let getData = {}

        const sql = `
        SELECT a.*, b.registroConselhoClasse, c.nome AS profissao
        FROM usuario a 
            JOIN usuario_unidade b ON a.usuarioID = b.usuarioID
            LEFT JOIN profissao c on (b.profissaoID = c.profissaoID)
        WHERE a.usuarioID = ? AND b.unidadeID = ?`
        const [result] = await db.promise().query(sql, [id, unidadeID])
        getData = result[0]
        getData['units'] = []

        // Se for admin, busca os dados da unidade e cargo
        if (admin == 1) {
            const sqlUnits = `
            SELECT a.*, b.registroConselhoClasse, b.unidadeID, d.nomeFantasia as unidade, c.profissaoID, b.status as statusUnidade,  c.nome AS profissao
            FROM usuario a 
                JOIN usuario_unidade b ON a.usuarioID = b.usuarioID
                LEFT JOIN profissao c on (b.profissaoID = c.profissaoID)
                JOIN unidade d on (b.unidadeID = d.unidadeID)
            WHERE a.usuarioID = ?
            ORDER BY IF(b.unidadeID = ${unidadeID}, 1, 0) DESC, d.nomeFantasia ASC `;

            const [resultUnits] = await db.promise().query(sqlUnits, [id])

            for (const unit of resultUnits) {
                unit[`unidade`] = {
                    id: unit.unidadeID,
                    nome: unit.unidade,
                }
                unit[`profissao`] = {
                    id: unit.profissaoID,
                    nome: unit.profissao,
                }
            }

            getData['units'] = resultUnits

            // inserir array de cargos no resultUnits 

            // Vare as unidades e insere os cargos
            for (const unitt of resultUnits) {
                const sqlCargos = `
                SELECT c.cargoID AS id, nome
                FROM usuario_unidade a
                    JOIN usuario_unidade_cargo b on (a.usuarioUnidadeID = b.usuarioUnidadeID)
                    JOIN cargo c on (b.cargoID = c.cargoID)
                WHERE a.usuarioID = ? and a.unidadeID = ?`;

                const [resultCargos] = await db.promise().query(sqlCargos, [id, unitt.unidadeID])

                unitt[`cargos`] = resultCargos
            }

            // Trazer todas as profissões
            const sqlProfissao = `
            SELECT * 
            FROM profissao
            WHERE status = 1 
            ORDER BY nome ASC`;

            const [resultProfissao] = await db.promise().query(sqlProfissao)
            getData['profissaoOptions'] = resultProfissao

            const sqlCargosAll = `
            SELECT cargoID AS id, nome
            FROM cargo
            WHERE status = 1
            ORDER BY nome ASC`;

            const [resultCargosAll] = await db.promise().query(sqlCargosAll)
            getData['cargosOptions'] = resultCargosAll

            const sqlUnidadesAll = `
            SELECT unidadeID, nomeFantasia AS nome
            FROM unidade
            WHERE status = 1
            ORDER BY nomeFantasia ASC`;

            const [resultUnidadesAll] = await db.promise().query(sqlUnidadesAll)
            getData['unidadesOptions'] = resultUnidadesAll

        }
        res.status(200).json(getData)
    }

    insertData(req, res) {
        const { nome } = req.body;
        db.query("SELECT * FROM usuario", (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json(err);
            } else {
                const rows = result.find(row => row.nome === nome);
                if (rows) {
                    res.status(409).json(err);
                } else {
                    db.query("INSERT INTO usuario (nome) VALUES (?)", [nome], (err, result) => {
                        if (err) {
                            console.log(err);
                            res.status(500).json(err);
                        } else {
                            res.status(201).json(result);
                        }
                    });
                }
            }
        });
    }

    async updateData(req, res) {
        const { id } = req.params
        const { nome, status } = req.body
        db.query("SELECT * FROM usuario", (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json(err);
            } else {
                // Verifica se já existe um registro com o mesmo nome e id diferente
                const rows = result.find(row => row.nome == nome && row.usuarioID != id);
                if (rows) {
                    res.status(409).json({ message: "Dados já cadastrados!" });
                } else {
                    // Passou na validação, atualiza os dados
                    const sql = `UPDATE usuario SET nome = ?, status = ? WHERE usuarioID = ?`;
                    const [result] = db.promise().query(sql, [nome, status, id]);

                    if (result.length === 0) {
                        res.status(404).json({ message: "Registro não encontrado!" });
                    }

                }
            }
        })
    }

    deleteData(req, res) {
        const { id } = req.params
        const objModule = {
            table: 'usuario',
            column: 'usuarioID'
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

module.exports = UsuarioController;