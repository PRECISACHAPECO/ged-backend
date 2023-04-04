const db = require('../../../config/db');
const { hasPending, deleteItem } = require('../../../config/defaultConfig');

class FornecedorController {

    getData(req, res) {
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
                db.query("SELECT * FROM par_fornecedor AS pf JOIN par_fornecedor_unidade AS pfu ON (pf.parFornecedorID = pfu.parFornecedorID) WHERE pfu.unidadeID = ? ORDER BY pf.ordem ASC", [unidadeID], (err, result) => {
                    if (err) { res.status(500).json(err); }

                    // Varrer result, pegando nomeColuna e inserir em um array 
                    // Exemplo: result = [{ nomeColuna: 'nome', valor: 'Fornecedor 1' }, { nomeColuna: 'cnpj', valor: '123456789' }, ...]
                    // Será gerado o seguinte array: ['nome', 'cnpj', ...]
                    const columns = result.map(row => row.nomeColuna);

                    // Montar select na tabela fornecedor, onde as colunas do select serão as colunas do array columns
                    // Exemplo: columns = ['nome', 'cnpj', ...]
                    // Será gerado o seguinte SQL: SELECT nome, cnpj, ... FROM fornecedor WHERE fornecedorID = id
                    const sql = `SELECT ${columns.join(', ')} FROM fornecedor WHERE fornecedorID = ?`;
                    db.query(sql, [id], (errData, resultData) => {
                        if (errData) { res.status(500).json(errData); }

                        const data = {
                            fields: result,
                            data: resultData[0]
                        }

                        res.status(200).json(data);
                    })
                })
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
        console.log('id: ', id)
        console.log('data: ', data)

        // Variavel data é um objeto, onde cada key do objeto será o nome da coluna e o valor será o valor da coluna da tabela fornecedor que será atualizada
        // Exemplo: data = { nome: 'Fornecedor 1', cnpj: '123456789', ... }
        // Será gerado o seguinte SQL: UPDATE fornecedor SET nome = 'Fornecedor 1', cnpj = '123456789', ... WHERE fornecedorID = id
        const sql = `UPDATE fornecedor SET ? WHERE fornecedorID = ${id}`;
        db.query(sql, [data], (err, result) => {
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