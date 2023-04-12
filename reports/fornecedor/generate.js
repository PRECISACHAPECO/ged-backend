const puppeteer = require('puppeteer');
const db = require('../../config/db');
const { generateContent } = require('./content');

async function reportFornecedor(req, res) {
    const { fornecedorID, unidadeID } = req.body;

    const [colunsFornecedor] = await db.promise().query(`
        SELECT * 
        FROM par_fornecedor a 
            JOIN par_fornecedor_unidade b ON (a.parFornecedorID = b.parFornecedorID) 
        WHERE b.unidadeID = ? ORDER BY a.ordem ASC`, [unidadeID]);

    // Varrer result, pegando nomeColuna e inserir em um array 
    const columns = colunsFornecedor.map(row => row.nomeColuna);
    const titleColumns = colunsFornecedor.map(row => row.nomeCampo);

    const resultData = [];

    for (let i = 0; i < columns.length; i++) {
        const sqlQuery = `SELECT ${columns[i]} FROM fornecedor WHERE fornecedorID = ?`;
        const [queryResult] = await db.promise().query(sqlQuery, [fornecedorID]);

        if (columns[i] === 'dataAvaliacao') {
            const dataAvaliacao = new Date(queryResult[0][columns[i]]).toLocaleDateString('pt-BR');
            resultData.push({
                title: titleColumns[i],
                value: dataAvaliacao
            });
        } else {
            resultData.push({
                title: titleColumns[i],
                value: queryResult[0][columns[i]]
            });
        }
    }

    const [blocos] = await db.promise().query(`SELECT * FROM par_fornecedor_bloco a WHERE a.unidadeID = ? `, [unidadeID]);
    const [atividades] = await db.promise().query(`SELECT GROUP_CONCAT(a.nome SEPARATOR ', ') as atividade FROM atividade a  LEFT JOIN fornecedor_atividade b on (a.atividadeID = b.atividadeID) WHERE b.fornecedorID = ?`, [fornecedorID]);
    const [sistemaQualidade] = await db.promise().query(`SELECT GROUP_CONCAT(a.nome SEPARATOR ', ') as sistemaQualidade FROM sistemaqualidade a  LEFT JOIN fornecedor_sistemaqualidade b on (a.sistemaQualidadeID = b.sistemaQualidadeID) WHERE b.fornecedorID = ?`, [fornecedorID]);

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const html = await generateContent(fornecedorID, unidadeID, blocos, resultData, atividades, sistemaQualidade);
        await page.setContent(html);

        const pdfBuffer = await page.pdf();
        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBuffer);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao gerar relatório');
    }
}

module.exports = { reportFornecedor };
