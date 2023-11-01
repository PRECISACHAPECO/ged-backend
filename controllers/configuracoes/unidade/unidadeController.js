const db = require('../../../config/db');
const { hasPending, deleteItem, criptoMd5 } = require('../../../config/defaultConfig');
const path = require('path');
const fs = require('fs');
const alterPassword = require('../../../email/template/user/alterPassword');
const sendMailConfig = require('../../../config/email');

class UnidadeController {
    async getList(req, res) {
        try {
            const { admin, unidadeID, usuarioID } = req.query;
            const sqlGetList = `
            SELECT 
            a.unidadeID AS id, a.nomeFantasia AS nome, e.nome AS status, e.cor
            FROM unidade AS a
            JOIN status AS e ON (a.status = e.statusID)
            WHERE a.unidadeID = ${unidadeID}`

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
                    cabecalhoRelatorio: resultSqlGetData[0].cabecalhoRelatorio ? `${process.env.BASE_URL_API}${resultSqlGetData[0].cabecalhoRelatorio}` : null,
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
            const [resultSqlExist] = await db.promise().query(sqlExist, [data.fields])

            const rows = resultSqlExist.find(row => row.cnpj === data.cnpj);

            if (!rows) {
                const sqlInsert = 'INSERT INTO unidade SET ?'
                const resultSqlInsert = await db.promise().query(sqlInsert, data.fields)
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

            const extensoes = data.fields.extensoes
            delete data.fields.extensoes
            delete data.fields.allExtensions
            delete data.fields.cabecalhoRelatorioTitle

            const sqlExist = 'SELECT * FROM unidade'
            const [resultSqlExist] = await db.promise().query(sqlExist)

            const rows = resultSqlExist.find(row => row.cnpj == data.fields.cnpj && row.unidadeID !== id);
            if (rows > 0) return res.status(409).json({ message: "CNPJ já cadastrado!" });

            delete data.fields.cabecalhoRelatorio
            const sqlUpdate = 'UPDATE unidade SET ? WHERE unidadeID = ?'
            const resultSqlUpdate = await db.promise().query(sqlUpdate, [data.fields, id])

            //? Atualiza extensões da unidade na tabela unidade_extensao 
            if (extensoes.length > 0) {
                const sqlDelete = 'DELETE FROM unidade_extensao WHERE unidadeID = ?'
                await db.promise().query(sqlDelete, id)

                const sqlInsert = 'INSERT INTO unidade_extensao (unidadeID, extensaoID) VALUES ?'
                const values = extensoes.map(extensao => [id, extensao.id])
                await db.promise().query(sqlInsert, [values])
            }

            if (data.senha) {

                const sqlUpdateUser = 'UPDATE usuario SET senha = ? WHERE usuarioID = ?'
                const [resultSqlUpdateUser] = await db.promise().query(sqlUpdateUser, [criptoMd5(data.senha), data.usuarioID])

                const sqlUnity = `
                SELECT 
                    a.*   
                FROM unidade AS a
                WHERE a.unidadeID = ?`

                const [resultUnity] = await db.promise().query(sqlUnity, [data.fields.unidadeID])

                const endereco = {
                    logradouro: resultUnity[0].logradouro,
                    numero: resultUnity[0].numero,
                    complemento: resultUnity[0].complemento,
                    bairro: resultUnity[0].bairro,
                    cidade: resultUnity[0].cidade,
                    uf: resultUnity[0].uf,
                }

                const enderecoCompleto = Object.entries(endereco).map(([key, value]) => {
                    if (value) {
                        return `${value}, `;
                    }
                }).join('').slice(0, -2) + '.'; // Remove a última vírgula e adiciona um ponto final

                // Chama a função que envia email para o usuário
                if (data.fields.email) {
                    const destinatario = data.fields.email
                    let assunto = 'GEDagro - Senha Alterada'
                    const values = {
                        // fabrica
                        enderecoCompletoFabrica: enderecoCompleto,
                        nomeFantasiaFabrica: resultUnity[0].nomeFantasia,
                        cnpjFabrica: resultUnity[0].cnpj,

                        // outros
                        nome: data.fields.nomeFantasia,
                        papelID: 2,
                        noBaseboard: false, // Se falso mostra o rodapé com os dados da fabrica, senão mostra dados do GEDagro,
                    }

                    const html = await alterPassword(values);
                    await sendMailConfig(destinatario, assunto, html)

                }

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
            const pathDestination = req.pathDestination
            const file = req.files[0]; //? Somente 1 arquivo

            const sqlSelectPreviousFileReport = `SELECT cabecalhoRelatorio FROM unidade WHERE unidadeID = ?`;
            const sqlUpdateFileReport = `UPDATE unidade SET cabecalhoRelatorio = ? WHERE unidadeID = ?`;

            //? Verificar se há arquivos enviados
            if (!file) {
                return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
            }

            // Obter o nome da foto de perfil anterior
            const [rows] = await db.promise().query(sqlSelectPreviousFileReport, [id]);
            const previousFileReport = rows[0]?.cabecalhoRelatorio;

            // Atualizar a foto de perfil no banco de dados
            await db.promise().query(sqlUpdateFileReport, [`${pathDestination}${file.filename}`, id]);

            // Excluir a foto de perfil anterior
            if (previousFileReport) {
                const previousFileReportPath = path.resolve(previousFileReport);
                fs.unlink(previousFileReportPath, (error) => {
                    if (error) {
                        return console.error('Erro ao excluir a imagem anterior:', error);
                    } else {
                        return console.log('Imagem anterior excluída com sucesso!');
                    }
                });
            }
            const photoProfileUrl = `${process.env.BASE_URL_API}${pathDestination}${file.filename}`;
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
            const previousPhotoProfile = rows[0]?.cabecalhoRelatorio;

            // Atualizar a foto de perfil no banco de dados
            await db.promise().query(sqlUpdatePhotoProfile, [null, id]);

            // Excluir a foto de perfil anterior
            if (previousPhotoProfile) {
                const previousPhotoPath = path.resolve(previousPhotoProfile);
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
        const objDelete = {
            table: ['unidade'],
            column: 'unidadeID'
        }
        const arrPending = [
            {
                table: 'anexo',
                column: ['unidadeID'],

            },
            {
                table: 'fornecedor',
                column: ['unidadeID'],

            },
            {
                table: 'recebimentomp',
                column: ['unidadeID'],

            },
            {
                table: 'limpeza',
                column: ['unidadeID'],

            },
            {
                table: 'item',
                column: ['unidadeID'],

            },
            {
                table: 'produto',
                column: ['unidadeID'],

            },
            {
                table: 'profissional',
                column: ['unidadeID'],

            },
            {
                table: 'usuario_unidade',
                column: ['unidadeID'],

            },
            {
                table: 'grupoanexo',
                column: ['unidadeID'],

            },

        ]

        if (!arrPending || arrPending.length === 0) {
            return deleteItem(id, objDelete.table, objDelete.column, res)
        }

        hasPending(id, arrPending)
            .then((hasPending) => {
                if (hasPending) {
                    res.status(409).json({ message: "Dado possui pendência." });
                } else {
                    return deleteItem(id, objDelete.table, objDelete.column, res)
                }
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json(err);
            });
    }
}

module.exports = UnidadeController;