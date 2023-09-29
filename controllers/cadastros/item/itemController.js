const db = require('../../../config/db');
const { hasConflict, hasPending, deleteItem } = require('../../../config/defaultConfig');

class ItemController {
    async getAlternatives(req, res) {
        const { alternativa } = req.body

        const sql = `
        SELECT alternativaItemID AS id, nome
        FROM alternativa_item 
        WHERE alternativaID = ?`
        const [result] = await db.promise().query(sql, [alternativa.id])

        for (let i = 0; i < result.length; i++) {
            result[i].anexo = false
            result[i].bloqueiaFormulario = false
            result[i].observacao = false
            result[i].anexos = [{ nome: '' }]
        }

        res.status(200).json(result)
    }

    async getList(req, res) {
        const { unidadeID } = req.params
        try {
            const sqlGetList = `
            SELECT 
                itemID AS id, 
                a.nome, 
                e.nome AS status,
                e.cor,
            b.nome AS formulario 
            FROM item AS a 
            LEFT JOIN par_formulario b ON (a.parFormularioID = b.parFormularioID) 
            JOIN status e ON (a.status = e.statusID)
            WHERE a.unidadeID = ?
            ORDER BY b.parFormularioID ASC, a.itemID ASC`
            const resultSqlGetList = await db.promise().query(sqlGetList, [unidadeID])
            return res.status(200).json(resultSqlGetList[0])
        } catch (error) {
            console.log(error)
        }
    }

    async getData(req, res) {
        try {
            const { id } = req.params;

            const sql = `
            SELECT i.itemID AS id, i.nome, i.status, i.ajuda, pf.parFormularioID, pf.nome AS formulario, a.alternativaID, a.nome AS alternativa
            FROM item AS i
                JOIN par_formulario AS pf ON (i.parFormularioID = pf.parFormularioID)
                JOIN alternativa AS a ON (i.alternativaID = a.alternativaID)
            WHERE i.itemID = ?`
            const [resultData] = await db.promise().query(sql, [id]);

            if (!resultData || resultData.length === 0) return res.status(404).json({ error: "Nenhum dado encontrado." })

            // Opções de seleção de formulário  
            const sqlOptionsFormulario = `SELECT parFormularioID AS id, nome FROM par_formulario`
            const [resultOptionsFormulario] = await db.promise().query(sqlOptionsFormulario);

            // Opções de eleção de alternativa 
            const sqlOptionsAlternativa = `SELECT alternativaID AS id, nome FROM alternativa WHERE status = 1`
            const [resultOptionsAlternativa] = await db.promise().query(sqlOptionsAlternativa);

            //? Opções do item 
            const sqlOpcoes = `
            SELECT io.itemOpcaoID AS id, ai.nome, ai.alternativaID, ai.alternativaItemID, io.anexo, io.bloqueiaFormulario, io.observacao
            FROM item_opcao AS io 
                JOIN alternativa_item AS ai ON (io.alternativaItemID = ai.alternativaItemID)
            WHERE io.itemID = ?`
            const [resultOpcoes] = await db.promise().query(sqlOpcoes, [id]);

            for (let i = 0; i < resultOpcoes.length; i++) {
                const sqlAnexos = `
                SELECT itemOpcaoAnexoID AS id, nome, obrigatorio
                FROM item_opcao_anexo 
                WHERE itemID = ? AND itemOpcaoID = ?`
                const [resultAnexos] = await db.promise().query(sqlAnexos, [id, resultOpcoes[i].id]);
                resultOpcoes[i].anexos = resultAnexos.length > 0 ? resultAnexos : [{ nome: '' }]
            }

            const result = {
                fields: {
                    formulario: {
                        id: resultData[0].parFormularioID,
                        nome: resultData[0].formulario,
                        opcoes: resultOptionsFormulario ?? []
                    },
                    nome: resultData[0].nome,
                    status: resultData[0].status,
                    alternativa: {
                        id: resultData[0].alternativaID,
                        nome: resultData[0].alternativa,
                        opcoes: resultOptionsAlternativa ?? []
                    },
                    ajuda: resultData[0].ajuda ?? '',
                    opcoes: resultOpcoes ?? []
                }
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
            const sqlInsert = `INSERT INTO item (nome, status, parFormularioID, unidadeID) VALUES (?, ?, ?, ?)`
            const [resultInsert] = await db.promise().query(sqlInsert, [values.fields.nome, (values.fields.status ? '1' : '0'), values.formulario.fields.id, values.unidadeID])
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
            console.log("🚀 ~ values:", id, values)
            // return

            if (!id || id == undefined) return res.status(400).json({ message: "ID não informado" })

            //* Valida conflito
            const validateConflicts = {
                columns: ['itemID', 'nome', 'parFormularioID', 'alternativaID', 'unidadeID'],
                values: [id, values.fields.nome, values.fields.formulario.id, values.fields.alternativa.id, values.unidadeID],
                table: 'item',
                id: id
            }
            if (await hasConflict(validateConflicts)) {
                return res.status(409).json({ message: "Dados já cadastrados!" });
            }

            //? Atualiza item
            const sqlUpdate = `UPDATE item SET nome = ?, parFormularioID = ?, alternativaID = ?, ajuda = ?, status = ? WHERE itemID = ?`;
            const [resultUpdate] = await db.promise().query(sqlUpdate, [values.fields.nome, values.fields.formulario.id, values.fields.alternativa.id, values.fields.ajuda, (values.fields.status ? '1' : '0'), id]);

            //? Atualiza item_opcao
            // Delete
            const sqlDelete = `DELETE FROM item_opcao WHERE itemID = ?`
            const [resultDelete] = await db.promise().query(sqlDelete, [id])

            // Delete
            const sqlDeleteAnexo = `DELETE FROM item_opcao_anexo WHERE itemID = ?`
            const [resultDeleteAnexo] = await db.promise().query(sqlDeleteAnexo, [id])

            // Insert
            const sqlInsertOpcao = `INSERT INTO item_opcao (itemID, alternativaItemID, anexo, bloqueiaFormulario, observacao) VALUES (?, ?, ?, ?, ?)`
            for (let i = 0; i < values.fields.opcoes.length; i++) {
                const element = values.fields.opcoes[i];
                const [resultInsertOpcao] = await db.promise().query(sqlInsertOpcao, [
                    id,
                    element.alternativaItemID,
                    (element.anexo ? '1' : '0'),
                    (element.bloqueiaFormulario ? '1' : '0'),
                    (element.observacao ? '1' : '0')
                ])
                const itemOpcaoID = resultInsertOpcao.insertId

                //? Atualiza item_opcao_anexo
                // Insert
                const sqlInsertAnexo = `INSERT INTO item_opcao_anexo (itemID, itemOpcaoID, nome, obrigatorio) VALUES (?, ?, ?, ?)`
                for (let j = 0; j < element.anexos.length; j++) {
                    const elementAnexo = element.anexos[j];
                    if (elementAnexo.nome != '') {
                        const [resultInsertAnexo] = await db.promise().query(sqlInsertAnexo, [
                            id,
                            itemOpcaoID,
                            elementAnexo.nome,
                            (elementAnexo.obrigatorio ? '1' : '0')
                        ])
                    }
                }
            }

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
        const tablesPending = ['fornecedor_resposta', 'par_fornecedor_bloco_item', 'par_recebimentomp_bloco_item', 'recebimentomp_resposta'] // Tabelas que possuem relacionamento com a tabela atual

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