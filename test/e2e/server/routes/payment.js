'use strict'

const express = require('express')
const router = express.Router()
const internalIp = require('internal-ip')

router.post('/create/ajax', (req, res, next) => {
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

module.exports = router
