'use strict'

const express = require('express')
const router = express.Router()

router.post('/', function(req, res, next) {
  res.sendFile('./mockpages/mockgateway.html', {
    root: __dirname
  })
})

router.post('/submit', (req, res, next) => {
  res.cookie('status', req.body.success)
  res.sendFile('./mockpages/payment.callback.html', {
    root: __dirname
  })
})

module.exports = router
