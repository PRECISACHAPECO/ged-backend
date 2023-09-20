const db = require('../../../config/db');
const { hasPending, deleteItem } = require('../../../config/defaultConfig');
const path = require('path');
const fs = require('fs');

class UnidadeController {
    async getList(req, res) {
        try {
            const { admin, unidadeID, usuarioID } = req.query;
            const sqlGetList = `
            SELECT 
            a.unidadeID AS id, a.nomeFantasia AS nome, e.nome AS status, e.cor
            FROM unidade AS a
            JOIN status AS e ON (a.status = e.statusID)
            WHERE unidadeID > 0`
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

            //? Todas as extensões da unidade
            const sqlMyExtensions = `SELECT extensaoID AS id, nome FROM extensao WHERE extensaoID IN (SELECT extensaoID FROM unidade_extensao WHERE unidadeID = ?)`
            const [resultExtensions] = await db.promise().query(sqlMyExtensions, id)

            //? Todas as extensões
            const sqlExtensions = `SELECT extensaoID AS id, nome FROM extensao`
            const [resultAllExtensions] = await db.promise().query(sqlExtensions)

            const result = {
                fields: {
                    ...resultSqlGetData[0],
                    cabecalhoRelatorio: resultSqlGetData[0].cabecalhoRelatorio ? `${process.env.BASE_URL_UPLOADS}report/${resultSqlGetData[0].cabecalhoRelatorio}` : null,
                    cabecalhoRelatorioTitle: resultSqlGetData[0].cabecalhoRelatorio,
                    extensoes: resultExtensions.length > 0 ? resultExtensions : [],
                    allExtensions: resultAllExtensions.length > 0 ? resultAllExtensions : []
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

            const extensoes = data.extensoes
            delete data.extensoes
            delete data.allExtensions

            const sqlExist = 'SELECT * FROM unidade'
            const resultSqlExist = await db.promise().query(sqlExist)

            const rows = resultSqlExist[0].find(row => row.cnpj == data.cnpj && row.unidadeID !== id);
            if (rows > 0) return res.status(409).json({ message: "CNPJ já cadastrado!" });

            const sqlUpdate = 'UPDATE unidade SET ? WHERE unidadeID = ?'
            const resultSqlUpdate = await db.promise().query(sqlUpdate, [data, id])

            //? Atualiza extensões da unidade na tabela unidade_extensao 
            if (extensoes.length > 0) {
                const sqlDelete = 'DELETE FROM unidade_extensao WHERE unidadeID = ?'
                await db.promise().query(sqlDelete, id)

                const sqlInsert = 'INSERT INTO unidade_extensao (unidadeID, extensaoID) VALUES ?'
                const values = extensoes.map(extensao => [id, extensao.id])
                await db.promise().query(sqlInsert, [values])
            }

            res.status(200).json({ message: 'Unidade atualizada com sucesso!' });
        } catch (error) {
            console.log(error)
        }
    }

    //! Atualiza a imagem de cabeçalho do relatório
    async updateDataReport(req, res) {
        try {
            const { id } = req.params;
            const reportFile = req.file;

            const sqlSelectPreviousFileReport = `SELECT cabecalhoRelatorio FROM unidade  WHERE unidadeID = ?`;
            const sqlUpdateFileReport = `UPDATE unidade SET cabecalhoRelatorio = ? WHERE unidadeID = ?`;

            // Verificar se um arquivo foi enviado
            if (!reportFile) {
                res.status(400).json({ error: 'Nenhum arquivo enviado.' });
                return;
            }

            // Obter o nome da foto de perfil anterior
            const [rows] = await db.promise().query(sqlSelectPreviousFileReport, [id]);
            const previousFileReport = rows[0]?.imagem;

            // Atualizar a foto de perfil no banco de dados
            await db.promise().query(sqlUpdateFileReport, [reportFile.filename, id]);

            // Excluir a foto de perfil anterior
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
            const photoProfileUrl = `${process.env.BASE_URL_UPLOADS}report/${reportFile.filename}`;
            res.status(200).json(photoProfileUrl);
        } catch (e) {
            console.log(e)
        }
    }

    //! Deleta a imagem no banco de dados e no caminho uploads/report
    async handleDeleteImage(req, res) {
        const { id } = req.params;

        const sqlSelectPreviousPhoto = `SELECT cabecalhoRelatorio FROM unidade WHERE unidadeID = ?`;
        const sqlUpdatePhotoProfile = `UPDATE unidade SET cabecalhoRelatorio = ? WHERE unidadeID = ?`;

        try {
            // Obter o nome da foto de perfil anterior
            const [rows] = await db.promise().query(sqlSelectPreviousPhoto, [id]);
            const previousPhotoProfile = rows[0]?.imagem;

            // Atualizar a foto de perfil no banco de dados
            await db.promise().query(sqlUpdatePhotoProfile, [null, id]);

            // Excluir a foto de perfil anterior
            if (previousPhotoProfile) {
                const previousPhotoPath = path.resolve('uploads/report', previousPhotoProfile);
                fs.unlink(previousPhotoPath, (error) => {
                    if (error) {
                        console.error('Erro ao excluir a imagem anterior:', error);
                    } else {
                        console.log('Imagem anterior excluída com sucesso!');
                    }
                });
            }
            res.status(200).json({ message: 'Imagem excluída com sucesso!' });
        } catch (error) {
            console.error('Erro ao excluir a imagem:', error);
            res.status(500).json({ error: 'Erro ao excluir a imagem' });
        }
    }

    async deleteData(req, res) {
        const { id } = req.params
        const objModule = {
            table: ['unidade'],
            column: 'unidadeID'
        }
        const tablesPending = []

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