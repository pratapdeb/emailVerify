const express = require('express')
const app = express()

app.use('/', require('./routes'))

app.listen(5000,()=>console.log('Listening at  5000'))