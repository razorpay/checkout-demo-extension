'use strict'

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const minimist = require('minimist')
const internalIp = require('internal-ip')

const argv = minimist(process.argv.slice(2));
const isSoakTesting = argv.soak;

console.log(isSoakTesting);
console.log(__dirname);

app.set('port', 3000)
app.use((req,res,next) => {
  res.cookie('soakTesting', !!isSoakTesting)
  next()
})

app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded())
app.use((req,res,next) => setTimeout(next, 3000))

app.post('/v1/payments/create/ajax', (req, res, next) => {
  let body = req.body

  switch (body.method) {
    case 'card':
    case 'netbanking':
      res.json({
        "type": "first",
        "request": {
          "url": `http:\/\/${internalIp.v4()}:3000\/v1\/gateway\/mocksharp\/payment?key_id=rzp_test_GGdPE9eCDHkMTk`,
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
            "DynamicUrl": `http:\/\/${internalIp.v4()}:3000\/v1\/payments\/pay_5yVtoQ5F4Sj21j\/callback\/5a7e3a597389dbc097a480669651931266af9733\/rzp_test_GGdPE9eCDHkMTk`,
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

app.post('/v1/gateway/mocksharp/payment', (req, res, next) => {
  res.sendFile('./mockpages/mockgateway.html', {
    root: __dirname
  })
})

app.post('/v1/gateway/mocksharp/payment/submit', (req, res, next) => {
  res.cookie('status', req.body.success)
  res.sendFile('/mockpages/payment.callback.html', {
    root: __dirname
  })
})

// app.listen(3000, function(error) {
//   if (error) {
//     console.error(`exec error: ${error}`)
//     process.exit(1)
//   }
// })

module.exports = app
