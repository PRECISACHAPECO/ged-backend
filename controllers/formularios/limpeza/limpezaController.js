const db = require('../../../config/db');
const fs = require('fs');
const path = require('path');
require('dotenv/config')

class LimpezaController {
    async getList(req, res) {
        const { unidadeID } = req.params;

        if (!unidadeID) return res.status(400).json({ error: 'unidadeID não informado!' })

        const sql = `
        SELECT parLimpezaModeloID AS id, nome, ciclo, status
        FROM par_limpeza_modelo 
        WHERE unidadeID = ?
        ORDER BY nome ASC`
        const [result] = await db.promise().query(sql, [unidadeID])

        return res.json(result);
    }

    async getData(req, res) {
        const { id } = req.body;
        try {
            if (!id || id == 'undefined') { return res.json({ message: 'Sem ID recebido!' }) }

            //? Header
            const sqlHeader = `
            SELECT pl.*, 
                (SELECT IF(COUNT(*) > 0, 1, 0)
                FROM par_limpeza_modelo AS plm 
                    JOIN par_limpeza_modelo_cabecalho AS plmc ON (plmc.parLimpezaID = pl.parLimpezaID AND plm.parLimpezaModeloID = plmc.parLimpezaModeloID)
                WHERE plm.parLimpezaModeloID = ?
                LIMIT 1
                ) AS mostra, 
                
                COALESCE((SELECT plmc.obrigatorio
                FROM par_limpeza_modelo AS plm 
                    JOIN par_limpeza_modelo_cabecalho AS plmc ON (plmc.parLimpezaID = pl.parLimpezaID AND plm.parLimpezaModeloID = plmc.parLimpezaModeloID)
                WHERE plm.parLimpezaModeloID = ?
                LIMIT 1
                ), 0) AS obrigatorio

            FROM par_limpeza AS pl`;
            const [resultHeader] = await db.promise().query(sqlHeader, [id, id]);

            //? Blocks
            const blocks = [];
            const sqlBlock = `SELECT * FROM par_limpeza_modelo_bloco WHERE parLimpezaModeloID = ? ORDER BY ordem ASC`;
            const [resultBlock] = await db.promise().query(sqlBlock, [id]);

            const sqlItem = `
            SELECT i.*, plmbi.*, a.nome AS alternativa, 
                (SELECT IF(COUNT(*) > 0, 1, 0)
                FROM fornecedor_resposta AS fr 
                WHERE fr.parFornecedorBlocoID = plmbi.parLimpezaModeloBlocoID AND fr.itemID = plmbi.itemID) AS hasPending
            FROM par_limpeza_modelo_bloco_item AS plmbi 
                LEFT JOIN item AS i ON (plmbi.itemID = i.itemID)
                LEFT JOIN alternativa AS a ON (plmbi.alternativaID = a.alternativaID)
            WHERE plmbi.parLimpezaModeloBlocoID = ?
            ORDER BY plmbi.ordem ASC`

            //? Options
            const sqlOptionsItem = `SELECT itemID AS id, nome FROM item WHERE parFormularioID = 1 AND status = 1 ORDER BY nome ASC`;
            const sqlOptionsAlternativa = `SELECT alternativaID AS id, nome FROM alternativa ORDER BY nome ASC`;
            const [resultAllCategories] = await db.promise().query(sqlAllCategories);
            const [resultAllActivities] = await db.promise().query(sqlAllActivities);
            const [resultItem] = await db.promise().query(sqlOptionsItem);
            const [resultAlternativa] = await db.promise().query(sqlOptionsAlternativa);
            const objOptionsBlock = {
                itens: resultItem,
                alternativas: resultAlternativa
            };

            for (const item of resultBlock) {
                const sqlBlockCategories = `
                SELECT pfbc.categoriaID AS id, c.nome
                FROM par_fornecedor_bloco_categoria AS pfbc
                    JOIN categoria AS c ON (pfbc.categoriaID = c.categoriaID)
                WHERE pfbc.parFornecedorBlocoID = ? AND pfbc.unidadeID = ?
                ORDER BY c.nome ASC`;

                const sqlBlockActivities = `
                SELECT pfba.atividadeID AS id, a.nome
                FROM par_fornecedor_bloco_atividade AS pfba 
                    JOIN atividade AS a ON (pfba.atividadeID = a.atividadeID)
                WHERE pfba.parFornecedorBlocoID = ? AND pfba.unidadeID = ?
                ORDER BY a.nome ASC`;

                const [resultCategoria] = await db.promise().query(sqlBlockCategories, [item.parFornecedorBlocoID, unidadeID]);
                const [resultAtividade] = await db.promise().query(sqlBlockActivities, [item.parFornecedorBlocoID, unidadeID]);
                const [resultItem] = await db.promise().query(sqlItem, [item.parFornecedorBlocoID]);

                for (const item of resultItem) {
                    if (item) {
                        item['new'] = false
                        item['item'] = {
                            id: item.itemID,
                            nome: item.nome
                        }
                        item['alternativa'] = {
                            id: item.alternativaID,
                            nome: item.alternativa
                        }
                    }
                }

                const objData = {
                    dados: item,
                    categorias: resultCategoria ? resultCategoria : [],
                    atividades: resultAtividade ? resultAtividade : [],
                    itens: resultItem,
                    optionsBlock: objOptionsBlock
                };

                blocks.push(objData);
            }

            //? Options
            const objOptions = {
                categorias: resultAllCategories,
                atividades: resultAllActivities,
                itens: resultItem,
                alternativas: resultAlternativa
            };

            //? Orientações
            const sqlOrientacoes = `SELECT obs FROM par_formulario WHERE parFormularioID = 1`;
            const [resultOrientacoes] = await db.promise().query(sqlOrientacoes)

            const result = {
                header: resultHeader,
                blocks: blocks,
                options: objOptions,
                orientations: resultOrientacoes[0]
            }

            return res.json(result)
        } catch (error) {
            return res.json({ message: 'Erro ao receber dados!' })
        }
    }
}

module.exports = LimpezaController;