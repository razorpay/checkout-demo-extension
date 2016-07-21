'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.set('port', 3000);
app.use(bodyParser.urlencoded());
app.use(express.static(__dirname));

app.use(function(req,res,next){setTimeout(next, 3000)});
app.post('/v1/payments/create/ajax', function (req, res, next) {
  let body = req.body;

  if (body.method === 'card') {
    res.json({
      "razorpay_payment_id": "pay_5x6vI0WYRykH9W"
    });
  }
});

// app.listen(3000, function(error) {
//   if (error) {
//     console.error(`exec error: ${error}`);
//     process.exit(1);
//   }
// });
//
module.exports = app;
