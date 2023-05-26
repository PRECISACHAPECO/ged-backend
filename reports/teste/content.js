async function generateContent(nome) {
  let html = `
  
  <h1>Hello World!! ${nome}</h1>
  `;

  return html;
}

module.exports = { generateContent };
