'use strict'

const express = require('express')
const app = express()
const bodyParser = require('body-parser')

app.set('port', 3000)
app.use(bodyParser.urlencoded())
app.use(express.static(__dirname))

app.use(function(req,res,next){setTimeout(next, 3000)})


app.post('/v1/payments/create/ajax', (req, res, next) => {
  let body = req.body

  switch (body.method) {
    case 'card':
      res.json({
        "razorpay_payment_id": "pay_5x6vI0WYRykH9W"
      })
      break
    case 'netbanking':
      res.json({
        "type": "first",
        "request": {
          "url": "http:\/\/0.0.0.0:3000\/v1\/gateway\/mock\/netbanking\/hdfc?key_id=rzp_test_GGdPE9eCDHkMTk",
          "method": "post",
          "content": {
            "ClientCode": "harshilrazorpaycom",
            "MerchantCode": "RAZORPAY",
            "TxnCurrency": "INR",
            "TxnAmount": 6000,
            "TxnScAmount": "0",
            "MerchantRefNo": "5yVtoQ5F4Sj21j",
            "SuccessStaticFlag": "N",
            "FailureStaticFlag": "N",
            "Date": "25\/07\/2016 13:07:59",
            "DynamicUrl": "http:\/\/api.razorpay.dev\/v1\/payments\/pay_5yVtoQ5F4Sj21j\/callback\/5a7e3a597389dbc097a480669651931266af9733\/rzp_test_GGdPE9eCDHkMTk",
            "CheckSum": "2911844120"
          }
        },
        "version": 1,
        "payment_id": "pay_5yVtoQ5F4Sj21j",
        "gateway": "eyJpdiI6IjZCY3ZpalhTN3RMQm9OditPblwvRytnPT0iLCJ2YWx1ZSI6IkFkR3llVDRcL21ucWY1cFp1NUdJTExjVHJxblRyUnp3MHhxV3NQTmxETFY4V2dcL0VZWkRJN0ZjK2xyYTdZV0x2TSIsIm1hYyI6IjQzZDg1M2YxZWY3Mzc0NWMzN2M0OTc1MTUyNzJkNjMyMDU5ODI4OTk1NTdiMzBjYmQ0MGQyNzJlZTY2NDgzYWYifQ=="
      })
      break
  }
})

app.post('/v1/gateway/mock/netbanking/hdfc', (req, res, next) => {
  res.redirect('/mockpages/payment.callback.html')
})

// app.listen(3000, function(error) {
//   if (error) {
//     console.error(`exec error: ${error}`)
//     process.exit(1)
//   }
// })
//
module.exports = app
