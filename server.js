// include dependencies
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const API_ROUTE = '/api';
const PORT = 8000;
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
app.listen(PORT, null, () =>
  console.log(
    '\x1b[33m%s\x1b[0m',
    `\nCheckout Server started at http://localhost:${PORT}`
  )
);
