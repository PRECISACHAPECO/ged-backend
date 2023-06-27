const cssDefault = () => {
  let cssDefault = `
      <head>
        <style>
        @page {
          size: A4;
          margin: 50px;
      }
          * {
            box-sizing: border-box;
            list-style: none;
            text-decoration: none;
          }
          
          body {
            font-family: 'Roboto', sans-serif;
            color: #333333;
          }
          .title {
            font-size: 28px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 20px;
          }
          .divider {
            border-top: 1px solid #e5e7eb;
          }
          .titleValues {
            font-size: 12px;
            font-weight: bold;
            color: #777777;
            margin-bottom: 8px;
          }
          .values {
            font-size: 14px;
            color: #222222;
          }
          .table {
            margin-top: 20px;
            width: 100%;
            margin-bottom: 20px;
            border-collapse: collapse;
            border-spacing: 0;
            font-size: 14px;
          }
          .table th,
          .table td {
            border: 1px solid #e5e7eb;
            padding: 12px;
            text-align: left;
          }
          .table th {
            background-color: #f1f1f1;
            font-weight: bold;
          }
          .page {
            page-break-after: always;
            height: 900px; /* Altura máxima da página */
        }
        </style>
      </head>
    `;
  return cssDefault;
};

module.exports = cssDefault;
