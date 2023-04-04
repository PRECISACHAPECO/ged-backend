const db = require('../../../config/db');
const { hasPending, deleteItem } = require('../../../config/defaultConfig');

class FornecedorController {

    async getData(req, res) {
        const functionName = req.headers['function-name'];
        const unidadeID = req.params.id

        switch (functionName) {
            case 'getList':
                db.query("SELECT fornecedorID AS id, cnpj, nomeFantasia, cidade, estado, telefone, status FROM fornecedor WHERE unidadeID = ?", [unidadeID], (err, result) => {
                    if (err) { res.status(500).json(err); }

                    res.status(200).json(result);
                })
                break;

            case 'getData':
                const { id } = req.params

                // Fields do header
                const sqlFields = `
                SELECT * 
                FROM par_fornecedor AS pf 
                    JOIN par_fornecedor_unidade AS pfu ON (pf.parFornecedorID = pfu.parFornecedorID) 
                WHERE pfu.unidadeID = ? 
                ORDER BY pf.ordem ASC`
                const [resultFields] = await db.promise().query(sqlFields, [unidadeID])
                if (resultFields.length === 0) { res.status(500).json('Error'); }

                // Varrer result, pegando nomeColuna e inserir em um array 
                const columns = resultFields.map(row => row.nomeColuna);

                // Montar select na tabela fornecedor, onde as colunas do select serão as colunas do array columns
                const sqlData = `SELECT ${columns.join(', ')} FROM fornecedor WHERE fornecedorID = ?`;
                const [resultData] = await db.promise().query(sqlData, [id])
                if (resultData.length === 0) { res.status(500).json('Error'); }

                // Atividades 
                const sqlAtividade = `
                SELECT a.*, 
                    (SELECT IF(COUNT(*) > 0, 1, 0)
                    FROM fornecedor_atividade AS fa 
                    WHERE fa.atividadeID = a.atividadeID AND fa.fornecedorID = ?) AS checked
                FROM atividade AS a 
                ORDER BY a.nome ASC;`
                const [resultAtividade] = await db.promise().query(sqlAtividade, [id])
                if (resultAtividade.length === 0) { res.status(500).json('Error'); }

                // Sistemas de qualidade 
                const sqlSistemaQualidade = `
                SELECT s.*, 
                    (SELECT IF(COUNT(*) > 0, 1, 0)
                    FROM fornecedor_sistemaqualidade AS fs
                    WHERE fs.sistemaQualidadeID = s.sistemaQualidadeID AND fs.fornecedorID = ?) AS checked
                FROM sistemaqualidade AS s
                ORDER BY s.nome ASC;`
                const [resultSistemaQualidade] = await db.promise().query(sqlSistemaQualidade, [id])
                if (resultSistemaQualidade.length === 0) { res.status(500).json('Error'); }

                // Blocos 
                const sqlBlocos = `
                SELECT * 
                FROM par_fornecedor_bloco
                WHERE unidadeID = ? AND status = 1
                ORDER BY ordem ASC`
                const [resultBlocos] = await db.promise().query(sqlBlocos, [unidadeID])

                // Itens
                const sqlItem = `
                SELECT pfbi.*, i.*, a.nome AS alternativa 
                FROM par_fornecedor_bloco_item AS pfbi 
                    LEFT JOIN item AS i ON (pfbi.itemID = i.itemID)
                    LEFT JOIN alternativa AS a ON (pfbi.alternativaID = a.alternativaID)
                WHERE pfbi.parFornecedorBlocoID = ?
                ORDER BY pfbi.ordem ASC`
                for (const item of resultBlocos) {
                    const [resultItem] = await db.promise().query(sqlItem, [item.parFornecedorBlocoID])

                    // Obter alternativas para cada item 
                    const sqlAlternativa = `
                    SELECT *
                    FROM par_fornecedor_bloco_item AS pfbi 
                        JOIN alternativa AS a ON (pfbi.alternativaID = a.alternativaID)
                        JOIN alternativa_item AS ai ON (a.alternativaID = ai.alternativaID)
                    WHERE pfbi.itemID = ?`
                    for (const item2 of resultItem) {
                        const [resultAlternativa] = await db.promise().query(sqlAlternativa, [item2.itemID])
                        item2.alternativas = resultAlternativa
                    }

                    item.itens = resultItem
                }

                const data = {
                    fields: resultFields,
                    data: resultData[0],
                    atividades: resultAtividade,
                    sistemasQualidade: resultSistemaQualidade,
                    blocos: resultBlocos
                }

                res.status(200).json(data);
                break;
        }
    }

    insertData(req, res) {
        const { nome } = req.body;
        db.query("SELECT * FROM item", (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json(err);
            } else {
                const rows = result.find(row => row.nome === nome);
                if (rows) {
                    res.status(409).json(err);
                } else {
                    db.query("INSERT INTO item (nome) VALUES (?)", [nome], (err, result) => {
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

    updateData(req, res) {
        const { id } = req.params
        const data = req.body
        console.log('Header: ', data.header)

        const sql = `UPDATE fornecedor SET ? WHERE fornecedorID = ${id}`;
        db.query(sql, [data.header], (err, result) => {
            if (err) { res.status(500).json(err); }
            // Ok
            res.status(200).json(result);
        });

    }

    deleteData(req, res) {
        const { id } = req.params
        const objModule = {
            table: 'item',
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

module.exports = FornecedorController;