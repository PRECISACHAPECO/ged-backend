const db = require('../../../config/db');
require('dotenv/config')
const path = require('path');
const fs = require('fs');
const { hasPending, deleteItem, getMenuPermissions, hasConflict, criptoMd5 } = require('../../../config/defaultConfig');
const multer = require('multer');
const { accessPermissions } = require('../../../defaults/functions');

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
            SELECT *
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
                imagem: resultDataUser[0].imagem ? `${process.env.BASE_URL_API}${resultDataUser[0].imagem}` : null,
                fields: resultDataUser[0],
                cargosFuncoes: resultFormacaoCargo,
                menu: await getMenuPermissions(1, resultDataUser[0].usuarioID, unidadeID)
            }

            res.status(200).json(values)
        } catch (error) {
            console.log("🚀 ~ error:", error)
        }
    }

    async getNewData(req, res) {
        try {
            const today = new Date();
            today.setDate(today.getDate() + 1);

            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');

            const formattedDate = `${year}-${month}-${day}`;

            const values = {
                fields: {},
                cargosFuncoes: [
                    {
                        data: formattedDate
                    }
                ],
                menu: await getMenuPermissions(1, 0, 1)
            };

            res.status(200).json(values);
        } catch (error) {
            console.log("🚀 ~ error:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    async insertData(req, res) {
        try {
            const data = req.body;
            console.log("🚀 ~ data:", data)

            //* Valida conflito
            const validateConflicts = {
                columns: ['cpf', 'unidadeID'],
                values: [data.fields.cpf, data.unidadeID],
                table: 'pessoa',
                id: null
            }
            if (await hasConflict(validateConflicts)) {
                return res.status(409).json({ message: "Dados já cadastrados!" });
            }

            // Cadastra novo profisional
            const InsertUser = `INSERT pessoa SET ? `
            const [resultInsertUser] = await db.promise().query(InsertUser, [data.fields])
            const pessoaID = resultInsertUser.insertId

            // Cadastro CARGOS / FUNÇÃO
            const insertCargo = `INSERT INTO pessoa_cargo (data, formacaoCargo, conselho, dataInativacao, pessoaID) VALUES (?, ?, ?, ?, ?)`
            if (data.cargosFuncoes.length > 0) {
                data.cargosFuncoes.map(async (row) => {
                    const [resultInsertCargo] = await db.promise().query(insertCargo, [row.data, row.formacaoCargo, row.conselho, (row.dataInativacao ?? null), pessoaID])
                })
            }

            // Se for usuario
            //* Marcou usuário do sistema
            if (data.isUsuario) {
                const sqlInsertUsuario = `INSERT INTO usuario (cpf, nome, senha) VALUES (?,?,?)`
                const [resultInsertUsuario] = await db.promise().query(sqlInsertUsuario, [data.fields.cpf, data.fields.nome, criptoMd5(data.senha)])
                const usuarioID = resultInsertUsuario.insertId

                const sqlInsertUsuarioUnity = `INSERT INTO usuario_unidade (usuarioID, unidadeID, papelID) VALUES (?,?, ?)`
                const [resultInsertUsuarioUnity] = await db.promise().query(sqlInsertUsuarioUnity, [usuarioID, data.fields.unidadeID, 1])

                const UpdateUser = `UPDATE pessoa SET usuarioID = ? WHERE pessoaID = ?`
                const [resultUpdateUser] = await db.promise().query(UpdateUser, [usuarioID, pessoaID])

                //* PERMISSÕES DE ACESSO
                const newData = {
                    ...data,
                    fields: {
                        ...data.fields,
                        usuarioID
                    },
                }
                console.log("dataaaa update sem isdddddd", newData)
                accessPermissions(newData)

                return res.status(200).json(pessoaID)
            }


            return res.status(200).json(pessoaID)
        } catch (error) {
            console.log("🚀 ~ error:", error)
        }
    }

    //! Atualiza a foto do perfil do usuário
    async updatePhotoProfile(req, res) {
        try {
            const { id } = req.params;
            const pathDestination = req.pathDestination
            const file = req.files[0]; //? Somente 1 arquivo

            const sqlSelectPreviousPhoto = `SELECT imagem FROM pessoa WHERE pessoaID = ?`;
            const sqlUpdatePhotoProfile = `UPDATE pessoa SET imagem = ? WHERE pessoaID = ?`;

            // Verificar se um arquivo foi enviado
            if (!file) {
                res.status(400).json({ error: 'Nenhum arquivo enviado.' });
                return;
            }

            // Obter o nome da foto de perfil anterior
            const [rows] = await db.promise().query(sqlSelectPreviousPhoto, [id]);
            const previousPhotoProfile = rows[0]?.imagem;

            // Atualizar a foto de perfil no banco de dados
            await db.promise().query(sqlUpdatePhotoProfile, [`${pathDestination}${file.filename}`, id]);

            // Excluir a foto de perfil anterior
            if (previousPhotoProfile) {
                const previousPhotoPath = path.resolve(previousPhotoProfile);
                fs.unlink(previousPhotoPath, (error) => {
                    if (error) {
                        return console.error('Erro ao excluir a imagem anterior:', error);
                    } else {
                        return console.log('Imagem anterior excluída com sucesso!');
                    }
                });
            }

            const photoProfileUrl = `${process.env.BASE_URL_API}${pathDestination}${file.filename}`;
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
        const { id, unidadeID } = req.params;

        const sqlSelectPreviousPhoto = `SELECT imagem FROM pessoa WHERE pessoaID = ?`;
        const sqlUpdatePhotoProfile = `UPDATE pessoa SET imagem = ? WHERE pessoaID = ?`;

        try {
            // Obter o nome da foto de perfil anterior
            const [rows] = await db.promise().query(sqlSelectPreviousPhoto, [id]);
            const previousPhotoProfile = rows[0]?.imagem;

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

    async verifyCPF(req, res) {
        const data = req.body
        try {
            const sql = `SELECT * FROM usuario WHERE cpf = ?`
            const [result] = await db.promise().query(sql, [data.cpf])
            if (result.length > 0) {
                return res.status(409).json({ message: "CPF já cadastrado!" });
            }
            return res.status(200).json({ message: "CPF válido!" });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao verificar CPF' });
        }
    }

    async updateData(req, res) {
        try {
            const { id } = req.params
            const data = req.body
            // //* Valida conflito
            // const validateConflicts = {
            //     columns: ['pessoaID', 'cpf', 'unidadeID'],
            //     values: [id, data.fields.cpf, data.fields.unidadeID],
            //     table: 'pessoa',
            //     id: id
            // }
            // if (await hasConflict(validateConflicts)) {
            //     return res.status(409).json({ message: "Dados já cadastrados!" });
            // }

            // Atualiza dados do profissional
            const UpdateUser = `UPDATE pessoa SET ? WHERE pessoaID = ?`
            const [resultUpdateUser] = await db.promise().query(UpdateUser, [data.fields, id])

            // Exclui cargos / função
            if (data.removedItems.length > 0) {
                const sqlDeleteItens = `DELETE FROM pessoa_cargo WHERE pessoaCargoID IN (${data.removedItems.join(',')})`
                const [resultDeleteItens] = await db.promise().query(sqlDeleteItens)
            }

            // Atualiza ou insere cargo | Função
            if (data.cargosFuncoes.length > 0) {
                data.cargosFuncoes.map(async (row) => {
                    const formatedData = row.data.substring(0, 10)
                    if (row && row.id > 0) { //? Já existe, atualiza
                        const sqlUpdateItem = `UPDATE pessoa_cargo SET data = ?, formacaoCargo = ?, conselho = ?,  dataInativacao = ?, status = ?  WHERE pessoaCargoID = ?`
                        const [resultUpdateItem] = await db.promise().query(sqlUpdateItem, [
                            formatedData,
                            row.formacaoCargo, row.conselho, (row.dataInativacao ?? null), (row.status ? '1' : '0'), row.id])
                    } else if (row && !row.id) {    //? Novo, insere
                        const sqlInsertItem = `INSERT INTO pessoa_cargo (data, formacaoCargo, conselho, dataInativacao, status, pessoaID) VALUES (?, ?, ?, ?, ?, ?)`
                        const [resultInsertItem] = await db.promise().query(sqlInsertItem, [formatedData, row.formacaoCargo, row.conselho, (row.dataInativacao ?? null), (row.status ? '1' : '0'), data.fields.pessoaID])
                    }
                })
            }

            //* Marcou usuário do sistema
            if (data.isUsuario) {
                const sqlCheckCPF = `SELECT * FROM usuario WHERE cpf = "${data.fields.cpf}"`
                const [resultCheckCPF] = await db.promise().query(sqlCheckCPF)

                //? Já existe usuário com esse CPF, copia usuário id para a tabela pessoa
                if (resultCheckCPF.length > 0) {
                    const usuarioID = resultCheckCPF[0].usuarioID

                    // Seta usuárioID na tabela pessoa
                    const UpdateUser = `UPDATE pessoa SET usuarioID = ? WHERE pessoaID = ?`
                    const [resultUpdateUser] = await db.promise().query(UpdateUser, [usuarioID, id])

                    // Verifica se já esta cadastrado na unidade
                    const sqlUnityCheck = `SELECT * FROM usuario_unidade WHERE usuarioID = ? AND unidadeID = ?`
                    const [resultUnityCheck] = await db.promise().query(sqlUnityCheck, [usuarioID, data.fields.unidadeID])

                    //? Já está cadastrado na unidade
                    if (resultUnityCheck.length.length > 0) {
                        // Força status como ativo 
                        const sqlUpdateUsuarioUnity = `UPDATE usuario_unidade SET status = ? WHERE usuarioID = ? AND unidadeID = ? `
                        const [resultUpdateUsuarioUnity] = await db.promise().query(sqlUpdateUsuarioUnity, [1, usuarioID, data.fields.unidadeID])
                    } else {
                        // Insere usuário na unidade
                        const sqlInsertUsuarioUnity = `INSERT INTO usuario_unidade (usuarioID, unidadeID, papelID) VALUES (?,?,?)`
                        const [resultInsertUsuarioUnity] = await db.promise().query(sqlInsertUsuarioUnity, [usuarioID, data.fields.unidadeID, 1])
                    }

                    //* PERMISSÕES DE ACESSO
                    accessPermissions(data)
                    res.status(200).json({ message: 'Dados atualizados com sucesso!' })
                }
                //? Ainda não existe o usuario com esse CPF, cria novo
                else {
                    const sqlInsertUsuario = `INSERT INTO usuario (cpf, nome, senha) VALUES (?,?,?)`
                    const [resultInsertUsuario] = await db.promise().query(sqlInsertUsuario, [data.fields.cpf, data.fields.nome, criptoMd5(data.senha)])
                    const usuarioID = resultInsertUsuario.insertId

                    const sqlInsertUsuarioUnity = `INSERT INTO usuario_unidade (usuarioID, unidadeID, papelID) VALUES (?,?, ?)`
                    const [resultInsertUsuarioUnity] = await db.promise().query(sqlInsertUsuarioUnity, [usuarioID, data.fields.unidadeID, 1])


                    const UpdateUser = `UPDATE pessoa SET usuarioID = ? WHERE pessoaID = ?`
                    const [resultUpdateUser] = await db.promise().query(UpdateUser, [usuarioID, id])

                    //* PERMISSÕES DE ACESSO
                    const newData = {
                        ...data,
                        fields: {
                            ...data.fields,
                            usuarioID
                        },
                    }
                    console.log("dataaaa update sem isdddddd", newData)
                    accessPermissions(newData)

                    res.status(200).json({ message: 'Dados atualizados com sucesso!' })
                }
            }
            //* Desmarcou usuário do sistema
            else {
                console.log("não é usaurio")
                const UpdateUser = `UPDATE pessoa SET usuarioID = ? WHERE pessoaID = ?`
                const [resultUpdateUser] = await db.promise().query(UpdateUser, [0, id])
                res.status(200).json({ message: 'Dados atualizados com sucesso!' })

            }

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