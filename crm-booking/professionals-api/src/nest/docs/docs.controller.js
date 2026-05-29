require('reflect-metadata');

const fs = require('node:fs');
const path = require('node:path');
const {
  Controller,
  Get,
  Param,
  Res,
} = require('@nestjs/common');
const swaggerUiDist = require('swagger-ui-dist');
const openApiDocument = require('../../contracts/public/professionals.openapi.json');
const {
  decorateMethod,
  decorateParam,
} = require('../common/decorators');

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

class DocsController {
  getDocs(res) {
    return res.type('html').send(createSwaggerHtml());
  }

  getOpenApi(res) {
    return res.status(200).json(openApiDocument);
  }

  getAsset(asset, res) {
    if (!asset || asset !== path.basename(asset)) {
      return res.status(404).json({
        error: {
          status: 404,
          code: 'NOT_FOUND',
          message: 'Rota não encontrada',
        },
      });
    }

    const filePath = path.join(swaggerAssetPath, asset);
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return res.status(404).json({
        error: {
          status: 404,
          code: 'NOT_FOUND',
          message: 'Rota não encontrada',
        },
      });
    }

    return res.sendFile(filePath);
  }
}

Controller('api-docs')(DocsController);

decorateMethod(DocsController, 'getDocs', [Get()]);
decorateParam(DocsController, 'getDocs', 0, Res());

decorateMethod(DocsController, 'getOpenApi', [Get('openapi.json')]);
decorateParam(DocsController, 'getOpenApi', 0, Res());

decorateMethod(DocsController, 'getAsset', [Get(':asset')]);
decorateParam(DocsController, 'getAsset', 0, Param('asset'));
decorateParam(DocsController, 'getAsset', 1, Res());

module.exports = DocsController;
