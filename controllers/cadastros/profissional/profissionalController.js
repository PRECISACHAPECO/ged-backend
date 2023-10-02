const db = require('../../../config/db');
require('dotenv/config')
const path = require('path');
const fs = require('fs');
const { hasPending, deleteItem, getMenuPermissions, hasConflict, criptoMd5 } = require('../../../config/defaultConfig');
const multer = require('multer');

class ProfissionalController {
    async getList(req, res) {
        const { unidadeID, papelID } = req.query

        if (!unidadeID || !papelID) {
            return res.status(400).json({ message: "Dados inválidos!" });
        }

        //? Busca usuários da unidade e papel atual 
        const sql = `
        SELECT
            a.pessoaID AS id,
            a.nome,
            e.nome AS status,
            e.cor
        FROM pessoa AS a 
            JOIN status AS e ON (a.status = e.statusID)
            WHERE a.unidadeID = ?`
        const [result] = await db.promise().query(sql, [unidadeID])

        res.status(200).json(result)
    }

    async getData(req, res) {
        const { id } = req.params
        const { unidadeID } = req.query
        try {

            // Dados do profissional
            const dataUser = `
            SELECT 
                *
                FROM pessoa AS a 
            WHERE a.pessoaID = ? AND a.unidadeID = ?;
            `
            const [resultDataUser] = await db.promise().query(dataUser, [id, unidadeID])

            // Cargos do profissional
            const formacaoCargo = `
            SELECT 
                a.pessoaCargoID AS id,
                a.data,
                a.formacaoCargo,
                a.conselho,
                a.dataInativacao,
                a.status
            FROM pessoa_cargo AS a
                JOIN pessoa AS b ON (a.pessoaID = b.pessoaID)
            WHERE  a.pessoaID = ? AND b.unidadeID = ? 
            ORDER BY a.data ASC;
            `
            const [resultFormacaoCargo] = await db.promise().query(formacaoCargo, [id, unidadeID])



            const values = {
                fields: resultDataUser[0],
                cargosFuncoes: resultFormacaoCargo
            }


            res.status(200).json(values)
        } catch (error) {
            console.log("🚀 ~ error:", error)
        }
    }

    async getNewData(req, res) {
        try {
            const values = {
                fields: {},
                cargosFuncoes: [{}]
            }
            res.status(200).json(values)

        } catch (error) {
            console.log("🚀 ~ error:", error)
        }
    }

    async insertData(req, res) {
        try {
            const data = req.body;
            console.log("🚀 ~ data:", data)

            return



        } catch (error) {
            console.log("🚀 ~ error:", error)
        }
    }

    //! Atualiza a foto do perfil do usuário
    async updatePhotoProfile(req, res) {
        try {
            const photoProfile = req.file;
            const { id } = req.params;
            const sqlSelectPreviousPhoto = `SELECT imagem FROM usuario WHERE usuarioID = ?`;
            const sqlUpdatePhotoProfile = `UPDATE usuario SET imagem = ? WHERE usuarioID = ?`;

            // Verificar se um arquivo foi enviado
            if (!photoProfile) {
                res.status(400).json({ error: 'Nenhum arquivo enviado.' });
                return;
            }

            // Obter o nome da foto de perfil anterior
            const [rows] = await db.promise().query(sqlSelectPreviousPhoto, [id]);
            const previousPhotoProfile = rows[0]?.imagem;

            // Atualizar a foto de perfil no banco de dados
            await db.promise().query(sqlUpdatePhotoProfile, [photoProfile.filename, id]);

            // Excluir a foto de perfil anterior
            if (previousPhotoProfile) {
                const previousPhotoPath = path.resolve('uploads/profile', previousPhotoProfile);
                fs.unlink(previousPhotoPath, (error) => {
                    if (error) {
                        return console.error('Erro ao excluir a imagem anterior:', error);
                    } else {
                        return console.log('Imagem anterior excluída com sucesso!');
                    }
                });
            }

            const photoProfileUrl = `${process.env.BASE_URL_UPLOADS}profile/${photoProfile.filename}`;
            res.status(200).json(photoProfileUrl);
        } catch (error) {
            console.log("🚀 ~ error:", error)
            if (error instanceof multer.MulterError) {
                // Erro do Multer (arquivo incompatível ou muito grande)
                if (error.code === 'LIMIT_FILE_SIZE') {
                    res.status(400).json({ error: 'O tamanho do arquivo excede o limite permitido.' });
                } else {
                    res.status(400).json({ error: 'O arquivo enviado é incompatível.' });
                }
            } else {
                // Outro erro interno do servidor
                res.status(500).json({ error: 'Erro interno do servidor.' });
            }
        }
    }

    async handleDeleteImage(req, res) {
        const { id } = req.params;

        const sqlSelectPreviousPhoto = `SELECT imagem FROM usuario WHERE usuarioID = ?`;
        const sqlUpdatePhotoProfile = `UPDATE usuario SET imagem = ? WHERE usuarioID = ?`;

        try {
            // Obter o nome da foto de perfil anterior
            const [rows] = await db.promise().query(sqlSelectPreviousPhoto, [id]);
            const previousPhotoProfile = rows[0]?.imagem;

            // Atualizar a foto de perfil no banco de dados
            await db.promise().query(sqlUpdatePhotoProfile, [null, id]);

            // Excluir a foto de perfil anterior
            if (previousPhotoProfile) {
                const previousPhotoPath = path.resolve('uploads/profile', previousPhotoProfile);
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

    async updateData(req, res) {
        try {
            const { id } = req.params
            console.log("🚀 ~ id:", id)
            const data = req.body
            console.log("🚀 ~ data:", data)
            const updateUserFormat = {
                ...data.fields,
                usuarioID: data.fields.usuarioID == true ? 1 : 0,
            };

            //* Valida conflito
            const validateConflicts = {
                columns: ['pessoaID', 'cpf'],
                values: [id, data.fields.cpf],
                table: 'pessoa',
                id: id
            }
            if (await hasConflict(validateConflicts)) {
                return res.status(409).json({ message: "Dados já cadastrados!" });
            }

            // Atualiza dados do profissional
            const UpdateUser = `UPDATE pessoa SET ? WHERE pessoaID = ?`
            const [resultUpdateUser] = await db.promise().query(UpdateUser, [updateUserFormat, id])

            // Exclui cargos / função
            if (data.removedItems.length > 0) {
                const sqlDeleteItens = `DELETE FROM pessoa_cargo WHERE pessoaCargoID IN (${data.removedItems.join(',')})`
                const [resultDeleteItens] = await db.promise().query(sqlDeleteItens)
            }

            // Atualiza ou insere cargo | Função
            if (data.cargosFuncoes.length > 0) {
                data.cargosFuncoes.map(async (row) => {
                    if (row && row.id > 0) { //? Já existe, atualiza
                        const sqlUpdateItem = `UPDATE pessoa_cargo SET data = ?, formacaoCargo = ?, conselho = ?,  dataInativacao = ?, status = ?  WHERE pessoaCargoID = ?`
                        const [resultUpdateItem] = await db.promise().query(sqlUpdateItem, [row.data, row.formacaoCargo, row.conselho, (row.dataInativacao ?? null), (row.status ? '1' : '0'), row.id])
                    } else if (row && !row.id) {    //? Novo, insere
                        const sqlInsertItem = `INSERT INTO pessoa_cargo (data, formacaoCargo, conselho, dataInativacao, status, pessoaID) VALUES (?, ?, ?, ?, ?, ?)`
                        const [resultInsertItem] = await db.promise().query(sqlInsertItem, [row.data, row.formacaoCargo, row.conselho, (row.dataInativacao ?? null), (row.status ? '1' : '0'), data.fields.pessoaID])
                    }
                })
            }

            // Verifica se profissional vai ter usuário e se o CPF já esta cadastrado
            if (data.fields.usuarioID > 0) {
                const sqlCheckCPF = `SELECT * FROM usuario WHERE cpf = ?`
                const [resultCheckCPF] = await db.promise().query(sqlCheckCPF, [data.fields.cpf])
                const sqlInsertUsuarioUnity = `INSERT INTO usuario_unidade (usuarioID, unidadeID, papelID) VALUES (?,?, ?)`

                if (resultCheckCPF.length > 0) {
                    console.log("Cpf já cadastrado")
                    // Verifica se já esta cadastrado na unidade
                    const sqlUnityCheck = `SELECT * FROM usuario_unidade WHERE usuarioID = ? AND unidadeID = ?`
                    const [resultUnityCheck] = await db.promise().query(sqlUnityCheck, [data.fields.usuarioID, data.fields.unidadeID])


                    if (resultUnityCheck.length > 0) {
                        console.log("Usuario já cadastrado na unidade")
                    } else {
                        const [resultInsertUsuarioUnity] = await db.promise().query(sqlInsertUsuarioUnity, [data.fields.usuarioID, data.fields.unidadeID], 1)
                    }

                } else {
                    console.log("No cpf já cadastrado")
                    const sqlInsertUsuario = `INSERT INTO usuario (cpf, nome, email, senha) VALUES (?,?,?,?)`
                    const [resultInsertUsuario] = await db.promise().query(sqlInsertUsuario, [data.fields.cpf, data.fields.nome, data.fields.email, criptoMd5(data.senha)])
                    console.log("Usuario cadatradop")
                    const [resultInsertUsuarioUnity] = await db.promise().query(sqlInsertUsuarioUnity, [resultInsertUsuario.insertId, data.fields.unidadeID, 1])
                    console.log("USUARIO UNIDADE CADASRRADODODOD")
                }
            }


            res.status(200).json({ message: 'Dados atualizados com sucesso!' })
        } catch (error) {
            console.log("🚀 ~ error:", error)
        }
    }

    deleteData(req, res) {
        const { id } = req.params
        const objModule = {
            table: ['usuario'],
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

const boolToNumber = (bool) => { return bool ? 1 : 0 }

const existsUsuarioUnidadePapel = async (usuarioID, unidadeID, papelID) => {
    const sql = `
    SELECT * 
    FROM usuario_unidade 
    WHERE usuarioID = ? AND unidadeID = ? AND papelID = ? `
    const [result] = await db.promise().query(sql, [usuarioID, unidadeID, papelID])
    return result.length > 0 ? true : false
}

const hasCargosEdit = (cargos) => {
    let hasEdit = false
    cargos.map(cargo => {
        if (cargo.edit) { hasEdit = true }
    })
    return hasEdit
}

module.exports = ProfissionalController;