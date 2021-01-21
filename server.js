// include dependencies
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const API_ROUTE = '/api';

const app = express();

// proxy middleware options
// create the proxy (without context)
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

// // for reverse proxy
// app.use(
//   API_SERVER_URL,
//   createProxyMiddleware({
//     target: API_ROUTE,
//     changeOrigin: true,
//   })
// );
app.use(express.static('./app'));
app.listen(8000);
