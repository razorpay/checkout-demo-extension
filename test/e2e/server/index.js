'use strict'

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const minimist = require('minimist')

const payment = require('./routes/payment')
const mockgateway = require('./routes/mockgateway')

const argv = minimist(process.argv.slice(2));
const isSoakTesting = argv.env === 'soaktesting';

app.set('port', 3000)
app.use((req,res,next) => {
  res.cookie('soakTesting', !!isSoakTesting)
  next()
})

app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded())
app.use((req,res,next) => setTimeout(next, 3000))

app.use('/v1/payments', payment)
app.use('/v1/gateway/mocksharp/payment', mockgateway)

// app.listen(3000, function(error) {
//   if (error) {
//     console.error(`exec error: ${error}`)
//     process.exit(1)
//   }
// })
//
module.exports = app
