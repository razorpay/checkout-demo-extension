'use strict';

const express = require('express');
const app = express();

app.set('port', 3000);
app.use(express.static(__dirname));

module.exports = app;

// let server = app.listen(app.get('port'), () => {
//   console.log(`Check http://localhost:${server.address().port}`);
// });
