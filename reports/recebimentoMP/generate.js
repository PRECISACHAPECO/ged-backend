const puppeteer = require('puppeteer');
const db = require('../../config/db');
const { generateContent } = require('./content');

async function reportRecebimentoMP(req, res) {
    const { recebimentompID, unidadeID } = req.body;

    const [colunsRecebimentoMP] = await db.promise().query(`
    SELECT * 
    FROM par_recebimentomp a 
        JOIN par_recebimentomp_unidade b ON (a.parRecebimentompID = b.parRecebimentompID) 
    WHERE b.unidadeID = ? ORDER BY a.ordem ASC`, [unidadeID]);

    // Varrer result, pegando nomeColuna e inserir em um array 
    const columns = colunsRecebimentoMP.map(row => row.nomeColuna);
    const titleColumns = colunsRecebimentoMP.map(row => row.nomeCampo);
    const tables = colunsRecebimentoMP.map(row => row.tabela);
    const types = colunsRecebimentoMP.map(row => row.tipo);

    const resultData = [];

    // Valida tipos dos campos, verifica se precisa fazer joim ou formatar a data
    for (let i = 0; i < tables.length; i++) {
        const objResult = await getData(recebimentompID, tables[i], titleColumns[i], columns[i], types[i]);
        resultData.push({
            title: objResult.title,
            value: objResult.value
        });
    }

    const [blocos] = await db.promise().query(`SELECT * FROM par_recebimentomp_bloco a WHERE a.unidadeID = ?`, [unidadeID]);
    const resultBlocos = []
    for (let i = 0; i < blocos.length; i++) {
        const [resultTemp] = await db.promise().query(`
        SELECT 
            a.*, b.*,
            case 
                when (SELECT al.nome
                FROM alternativa al 
            WHERE al.alternativaID = a.alternativaID) = 'Data' 
            then (SELECT DATE_FORMAT(fr.resposta, '%d/%m/%Y') 
                FROM recebimentomp_resposta fr 
            WHERE fr.recebimentompID = ? AND fr.parRecebimentompBlocoID = a.parRecebimentompBlocoID AND fr.itemID = a.itemID)
            else  (SELECT fr.resposta 
                FROM recebimentomp_resposta fr 
            WHERE fr.recebimentompID = ? AND fr.parRecebimentompBlocoID = a.parRecebimentompBlocoID AND fr.itemID = a.itemID)
            END as resposta,
            
            (SELECT fr.obs 
                FROM recebimentomp_resposta fr 
            WHERE fr.recebimentompID = ? AND fr.parRecebimentompBlocoID = a.parRecebimentompBlocoID AND fr.itemID = a.itemID) AS obsResposta
        FROM par_recebimentomp_bloco_item a
        JOIN item b on (a.itemID = b.itemID)
        WHERE a.parRecebimentompBlocoID = ?
        AND a.status = 1;`, [recebimentompID, recebimentompID, recebimentompID, blocos[i].parRecebimentompBlocoID]);

        resultBlocos.push({
            parRecebimentompBlocoID: blocos[i].parRecebimentompBlocoID,
            nome: blocos[i].nome,
            obs: blocos[i].obs,
            itens: resultTemp
        });
    }

    const [data] = await db.promise().query(`SELECT * FROM recebimentomp WHERE recebimentompID = ?`, [recebimentompID]);


    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const html = await generateContent(resultData, resultBlocos, data);
        await page.setContent(html);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="meu_relatorio.pdf"`);

        const pdfBuffer = await page.pdf({
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


        res.send(pdfBuffer);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao gerar relatório');
    }
}

async function getData(recebimentompID, table, title, column, type) {
    let sql
    // Faz join com outra tabela
    if (table != null) {
        sql = `
            SELECT b.nome
            FROM recebimentomp AS a
                JOIN ${table} AS b ON (a.${column} = b.${column})
            WHERE a.recebimentompID = ${recebimentompID}`
    }
    // Não faz join com outra tabela (se for data, formata a data)
    else {
        sql = `
            SELECT ${type == 'date' ? `DATE_FORMAT(a.${column}, "%d/%m/%Y")` : `a.${column}`}  AS nome
            FROM recebimentomp AS a
            WHERE a.recebimentompID = ${recebimentompID}`
    }

    const [resultData] = await db.promise().query(sql);

    return {
        title: title ?? 'N/I',
        value: resultData[0].nome ?? 'N/I'
    }
}

module.exports = { reportRecebimentoMP };
