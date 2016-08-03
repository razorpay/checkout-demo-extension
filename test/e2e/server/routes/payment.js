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

    case 'wallet':
      res.json({
        "type": "otp",
        "request": {
          "url": `http:\/\/${internalIp.v4()}:3000\/v1\/payments\/pay_62B6orv7osU28l\/otp_submit\/3bf3056e1906e8049dc5f71aef56c4d7fa795dcd?key_id=rzp_test_1DP5mmOlF5G5ag`,
          "method": "post"
        },
        "version": 1,
        "payment_id": "pay_62B6orv7osU28l",
        "gateway": "eyJpdiI6IkF6TmJIampUWjdTcERjb0t1WkFqUmc9PSIsInZhbHVlIjoic3VXTWpVb3ZiQjZhVTM4cmZVUHFsYmphYjZYOCtmbkFcL2ZtXC9DcDc2Z01zPSIsIm1hYyI6IjcyMGM1N2FlZGE5NTY0MTdmMTU4NjYxZjQwYjk4ZTUyMTlmYmM5MWQxZjdjMWVkYWMzNzhiZTFkYjM1YTNmMzEifQ=="
      })
  }
})

router.post('/:id/otp_resend', (req, res, next) => {
  res.json({
    "type": "otp",
    "request": {
      "url": `http:\/\/${internalIp.v4()}:3000\/v1\/payments\/pay_62B6orv7osU28l\/otp_submit\/3bf3056e1906e8049dc5f71aef56c4d7fa795dcd?key_id=rzp_test_1DP5mmOlF5G5ag`,
      "method": "post"
    },
    "version": 1,
    "payment_id": "pay_62B6orv7osU28l",
    "gateway": "eyJpdiI6Im9TSFhSVDFqNnlzYlNxYXJCdkNXUlE9PSIsInZhbHVlIjoiNFJmWTNiS2xDSnd6MHBBc0tMK2YyMzY0dGNiY3gxNHRPaEV3R2FBXC90NW89IiwibWFjIjoiMTE4NDk3NGI2YjQ0YjkwMDUwZjVhYjAyYjcwMDBhYjk5M2ZiNjcwMDgyNGRjMjk3MDVlZThmYmJlZDI3OGYwMyJ9"
  })
})

router.post('/:id/otp_submit/:id', (req, res, next) => {
  res.json({
    "razorpay_payment_id":"pay_62B6orv7osU28l"
  })
})

module.exports = router
