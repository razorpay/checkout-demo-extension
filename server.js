// include dependencies
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const bodyParser = require('body-parser');

const mockAPIRouter = require('./mock-api/router');
const { logger } = require('./mock-api/utils');

const API_ROUTE = '/api';
const PORT = 8000;
const app = express();

if (process.env.API_SERVER.includes('localhost')) {
  app.use(cors());
  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
      limit: '1mb',
      encoding: 'utf8', // Remove if you want a buffer
    })
  );
  app.use(API_ROUTE, mockAPIRouter);
  logger(`Running on Mock-API`);
} else {
  app.use(
    API_ROUTE,
    createProxyMiddleware({
      target: process.env.API_SERVER,
      changeOrigin: true,
      pathRewrite: path => {
        return path.replace('/api/', '/');
      },
    })
  );
  logger(`Running on Live Server`);
}

app.use(express.static('./app'));
app.listen(PORT, null, () =>
  logger(`Checkout Server started at http://localhost:${PORT}`)
);
