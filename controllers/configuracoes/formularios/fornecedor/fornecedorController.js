const db = require('../../../../config/db');
const { hasPending, deleteItem } = require('../../../../config/defaultConfig');

class FornecedorController {

    getData(req, res) {
        const unidadeID = 1;

        const sql = `
        SELECT pf.*, 
            (SELECT IF(COUNT(*) > 0, 1, 0)
            FROM par_fornecedor_unidade AS pfu 
            WHERE pf.parFornecedorID = pfu.parFornecedorID AND pfu.unidadeID = ?) AS mostra,
            
            COALESCE((SELECT pfu.obrigatorio
            FROM par_fornecedor_unidade AS pfu 
            WHERE pf.parFornecedorID = pfu.parFornecedorID AND pfu.unidadeID = ?), 0) AS obrigatorio            
        FROM par_fornecedor AS pf 
        ORDER BY pf.ordem ASC;`

        db.query(sql, [unidadeID, unidadeID], (err, result) => {
            if (err) {
                res.status(500).json(err);
            } else {
                res.status(200).json(result);
            }
        })
    }

    updateData(req, res) {
        const unidadeID = 1
        const data = req.body
        console.log('data: ', data)

        const sql = `SELECT * FROM par_fornecedor`

        db.query(sql, [unidadeID], (err, result) => {
            if (err) {
                res.status(500).json(err);
            } else {
                // Laço em result com todas as opçõies disponiveis no BD 
                for (let i = 0; i < result.length; i++) {
                    let selected = 0;
                    // Varre objeto vindo do frontend
                    for (const prop in data) {
                        if(result[i]['nomeColuna'] == prop && data[prop] === true) selected = 1;
                    }
                    if(selected == 1){ // Marcou pra mostrar no formulário
                        // Verifica se ainda nao existe na minha unidade
                        const sqlSelect = `SELECT * FROM par_fornecedor_unidade AS t1 JOIN par_fornecedor t2 ON t1.parFornecedorID = t2.parFornecedorID WHERE t2.nomeColuna = ? AND t1.unidadeID = ?`                        
                        db.query(sqlSelect, [result[i]['nomeColuna'], unidadeID], (errSelect, resSelect) => {
                            if (err) {
                                console.log('erro ao selecionar')
                            } else {
                                
                                if(resSelect.length == 0){ // Precisa inserir
                                    const sqlInsert = `INSERT INTO par_fornecedor_unidade (parFornecedorID, unidadeID) VALUES (?, ?)`
                                    db.query(sqlInsert, [result[i]['parFornecedorID'], unidadeID], (errInsert, resInsert) => {
                                        if (err) {
                                            console.log('erro ao inserir')
                                        } else {
                                            console.log(result[i]['nomeColuna'] + ' foi inserido')
                                        }
                                    })
                                }else{
                                    console.log(result[i]['nomeColuna'] + ' já existe')
                                }
                            }
                        })                                    

                        // Se ainda nao existe, insere
                        console.log(result[i]['nomeColuna'] + ' mostra no formulário')
                        const sqlInsert = `INSERT INTO par_fornecedor_unidade (parFornecedorID, unidadeID) VALUES (?, ?)`       
                    }else{
                        // Deletar
                        if(result && result[i]['nomeColuna']){
                            console.log('script pra deletar a coluna: ', result[i]['nomeColuna'])
                            const sqlDelete = `DELETE t1 FROM par_fornecedor_unidade t1 JOIN par_fornecedor t2 ON t1.parFornecedorID = t2.parFornecedorID WHERE t2.nomeColuna = ? AND t1.unidadeID = ?`
                            db.query(sqlDelete, [result[i]['nomeColuna'], unidadeID], (errDelete, resDelete) => {
                                if (err) {
                                    console.log('erro ao excluir')
                                } else {
                                    console.log(result[i]['nomeColuna'] + ' foi excluido')
                                }
                            })
                        }
                    }
                }
            }
        })        
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