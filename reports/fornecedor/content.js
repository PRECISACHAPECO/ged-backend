

async function generateContent(
  fornecedorID,
  unidadeID,
  blocos,
  resultData,
  atividades,
  sistemaQualidade
) {
  let html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Questionário de Auto Avaliação do Fornecedor</title>
      <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css"
      />
      <style>
      .fontBaseTitle {
        font-size: 10px;
        font-weight: bold;
      }
      .fontBase {
        font-size: 14px;
      }
      .divider {
        border-bottom: 1px solid #9ca3af;
        opacity: 0.2;
      }
      .padding {
        padding: 8px;
      }
    </style>
      </head>
      <body>
        <!-- Cabeçalho -->
        <h1 class="text-lg font-bold text-center bg-red-600">
          QUESTIONÁRIO DE AUTO AVALIAÇÃO DO FORNECEDOR
        </h1>
  `;

  return html;
}

module.exports = { generateContent };
