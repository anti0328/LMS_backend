const express = require('express')
const auth = require('../middleware/auth')
const router = new express.Router()
const {
  login
} = require('../controller/userController/userController')


router.post('/login', login)

module.exports = router
