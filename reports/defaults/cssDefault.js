const cssDefault = () => {
    let cssDefault = `
      <head>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            list-style: none;
            text-decoration: none;
          }
          body {
            margin: 40px 30px 10px 30px;
            font-family: roboto, sans-serif;
          }
          .title {
            color: #27272A;
            font-size: 26px;
            font-weight: bold;
            text-align: center;
          }
          .divider {
            border-top: 1px solid #e5e7eb;
          }
          .titleValues {
            font-size: 10px;
            font-weight: bold;
            color: #27272A;
          }
          .values {
            font-size: 12px;
            color: #4B4B4B;
          }
          .table {
            margin-top: 20px;
            width: 100%;
            margin-bottom: 20px;
            border-collapse: collapse;
            border-spacing: 0;
            font-size: 14px; /* Aumente o tamanho da fonte para 14px */
          }
          .table th,
          .table td {
            border: 1px solid #e5e7eb;
            padding: 8px;
            text-align: left;
          }
          .table th {
            background-color: #f1f1f1;
          }
        </style>
      </head>
    `;
    return cssDefault;
};

module.exports = cssDefault;
