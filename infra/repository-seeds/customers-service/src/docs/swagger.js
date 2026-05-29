const express = require('express');
const swaggerUiDist = require('swagger-ui-dist');
const openApiDocument = require('../contracts/public/customers.openapi.json');

const swaggerAssetPath = swaggerUiDist.getAbsoluteFSPath();

const createSwaggerHtml = () => {
  const title = openApiDocument.info?.title || 'Service API';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
    <link rel="stylesheet" href="/api-docs/swagger-ui.css">
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="/api-docs/swagger-ui-bundle.js"></script>
    <script src="/api-docs/swagger-ui-standalone-preset.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/api-docs/openapi.json',
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: 'StandaloneLayout'
      });
    </script>
  </body>
</html>`;
};

const registerSwaggerDocs = (app) => {
  app.get('/api-docs/openapi.json', (req, res) => {
    res.status(200).json(openApiDocument);
  });
  app.get(['/api-docs', '/api-docs/'], (req, res) => {
    res.type('html').send(createSwaggerHtml());
  });
  app.use('/api-docs', express.static(swaggerAssetPath, { index: false }));
};

module.exports = {
  registerSwaggerDocs,
};
