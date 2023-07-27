const db = require('../../../config/db');
const { hasPending, deleteItem } = require('../../../config/defaultConfig');

class UnidadeController {
    async getList(req, res) {
        try {
            const { admin, unidadeID, usuarioID } = req.query;
            const sqlGetList = `
            SELECT unidadeID AS id, nomeFantasia AS nome, status
            FROM unidade 
            WHERE unidadeID > 0 `
            const [resultGetList] = await db.promise().query(sqlGetList)
            res.status(200).json(resultGetList);
        } catch (error) {
            console.log(error)
        }

    }

    async getData(req, res) {
        try {
            const { id } = req.params
            const sqlGetData = 'SELECT * FROM unidade WHERE unidadeID = ?'
            const [resultSqlGetData] = await db.promise().query(sqlGetData, id)
            const result = {
                fields: {
                    ...resultSqlGetData[0],
                    cabecalhoRelatorio: resultSqlGetData[0].cabecalhoRelatorio ? `${process.env.BASE_URL_UPLOADS}report/${resultSqlGetData[0].cabecalhoRelatorio}` : null,
                    cabecalhoRelatorioTitle: resultSqlGetData[0].cabecalhoRelatorio
                }
            }
            res.status(200).json(result);
        } catch (error) {
            console.log(error)
        }
    }

    async insertData(req, res) {
        try {
            const data = req.body;
            const sqlExist = 'SELECT * FROM unidade'
            const [resultSqlExist] = await db.promise().query(sqlExist)

            const rows = resultSqlExist.find(row => row.cnpj === data.cnpj);

            if (!rows) {
                const sqlInsert = 'INSERT INTO unidade SET ?'
                const resultSqlInsert = await db.promise().query(sqlInsert, data)
                console.log(" entrou", resultSqlInsert)
                const id = resultSqlInsert[0].insertId
                res.json(id)

            }
        } catch (error) {
            console.log(error)
        }
    }

    async updateData(req, res) {
        try {
            const { id } = req.params
            const data = req.body

            const sqlExist = 'SELECT * FROM unidade'
            const resultSqlExist = await db.promise().query(sqlExist)

            const rows = resultSqlExist[0].find(row => row.cnpj == data.cnpj && row.unidadeID !== id);
            if (rows > 0) return res.status(409).json({ message: "CNPJ já cadastrado!" });

            const sqlUpdate = 'UPDATE unidade SET ? WHERE unidadeID = ?'
            const resultSqlUpdate = await db.promise().query(sqlUpdate, [data, id])
            res.status(200).json({ message: 'Unidade atualizada com sucesso!' });
        } catch (error) {
            console.log(error)
        }
    }

    async updateDataReport(req, res) {
        try {
            const { id } = req.params;
            const reportFile = req.file;

            console.log("id da unidade", id)
            const sqlSelectPreviousFileReport = `SELECT cabecalhoRelatorio FROM unidade  WHERE unidadeID = ?`;
            const sqlUpdateFileReport = `UPDATE unidade SET cabecalhoRelatorio = ? WHERE unidadeID = ?`;

            // Verificar se um arquivo foi enviado
            if (!reportFile) {
                res.status(400).json({ error: 'Nenhum arquivo enviado.' });
                return;
            }

            //! Obter o nome da foto de perfil anterior
            const [rows] = await db.promise().query(sqlSelectPreviousFileReport, [id]);
            const previousFileReport = rows[0]?.imagem;

            //! Atualizar a foto de perfil no banco de dados
            await db.promise().query(sqlUpdateFileReport, [reportFile.filename, id]);

            //! Excluir a foto de perfil anterior
            if (previousFileReport) {
                const previousFileReportPath = path.resolve('uploads/report', previousFileReport);
                fs.unlink(previousFileReportPath, (error) => {
                    if (error) {
                        return console.error('Erro ao excluir a imagem anterior:', error);
                    } else {
                        return console.log('Imagem anterior excluída com sucesso!');
                    }
                });
            }
            res.status(200).json({ message: 'Atualizado com sucesso' });
        } catch (e) {
            console.log(e)
        }
    }

    deleteData(req, res) {
        const { id } = req.params
        const objModule = {
            table: ['unidade'],
            column: 'unidadeID'
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

module.exports = UnidadeController;