const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

const user = require('./routes/user')
const canvas = require('./routes/canvas')

require('dotenv').config();

app.use(cors())

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/users', user)
app.use('/canvas', canvas)

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log('app is on Port ' + port)
})
