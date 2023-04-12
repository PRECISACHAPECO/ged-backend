// Importação das bibliotecas
const ejs = require('ejs');
const path = require('path');
const puppeteer = require('puppeteer');
const db = require('../../config/db');


const http = require('http');
const url = require('url');
const querystring = require('querystring');

async function gerarPDF(request, response) {




    const { pathname, query } = url.parse(request.url);

    console.log(pathname, query)
    const { unidadeID, fornecedorID } = querystring.parse(query);

    console.log("gerarPDF", fornecedorID, unidadeID)

    // ...


    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`http://localhost:3333/fornecedor?fornecedorID=${fornecedorID}&unidadeID=${unidadeID}`, {
        waitUntil: 'networkidle0'
    });
    const pdf = await page.pdf({
        printBackground: true,
        format: 'A4',
        margin: {
            top: '30px',
            bottom: '20px',
            left: '50px',
            right: '50px'
        }
    });
    await browser.close();
    response.contentType("application/pdf");
    return response.send(pdf);
}

async function renderizarHTML(request, response) {
    const filePath = path.join(__dirname, "fornecedor.ejs");
    // const unidadeID = 1;
    // const fornecedorID = 1;

    const { fornecedorID, unidadeID } = request.query
    console.log("renderizaHTML", fornecedorID, unidadeID)




    try {
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
        const [atividades] = await db.promise().query(`SELECT GROUP_CONCAT(a.nome SEPARATOR ', ') as atividade FROM atividade a  LEFT JOIN fornecedor_atividade b on (a.atividadeID = b.atividadeID) WHERE b.fornecedorID = ?`, [fornecedorID]);
        const [sistemaQualidade] = await db.promise().query(`SELECT GROUP_CONCAT(a.nome SEPARATOR ', ') as sistemaQualidade FROM sistemaqualidade a  LEFT JOIN fornecedor_sistemaqualidade b on (a.sistemaQualidadeID = b.sistemaQualidadeID) WHERE b.fornecedorID = ?`, [fornecedorID]);
        const [blocos] = await db.promise().query(`SELECT * FROM par_fornecedor_bloco a WHERE a.unidadeID = ? `, [unidadeID]);

        const resultBlocos = []
        for (let i = 0; i < blocos.length; i++) {
            const [resultTemp] = await db.promise().query(`
            SELECT a.*, b.*,
                (SELECT fr.resposta 
                    FROM fornecedor_resposta fr 
                WHERE fr.fornecedorID = ? AND fr.parFornecedorBlocoID = a.parFornecedorBlocoID AND fr.itemID = a.itemID) AS resposta,
                (SELECT fr.obs 
                    FROM fornecedor_resposta fr 
                WHERE fr.fornecedorID = ? AND fr.parFornecedorBlocoID = a.parFornecedorBlocoID AND fr.itemID = a.itemID) AS obsResposta
            FROM par_fornecedor_bloco_item a 
                JOIN item b ON (a.itemID = b.itemID)
            WHERE a.parFornecedorBlocoID = ? AND a.status = 1
            ORDER BY a.ordem ASC`, [fornecedorID, fornecedorID, blocos[i].parFornecedorBlocoID]);

            resultBlocos.push({
                parFornecedorBlocoID: blocos[i].parFornecedorBlocoID,
                nome: blocos[i].nome,
                obs: blocos[i].obs,
                itens: resultTemp
            });
        }

        // Renderizar o arquivo EJS com o objeto atualizado
        ejs.renderFile(filePath, { resultData, atividades, sistemaQualidade, resultBlocos }, (err, html) => {
            if (err) {
                return response.send('Erro na leitura do arquivo');
            }
            return response.send(html);
        });
    } catch (err) {
        console.error(err);
        return response.send('Erro na consulta do banco de dados');
    }
}

module.exports = { gerarPDF, renderizarHTML };
