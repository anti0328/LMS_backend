const express = require('express')
const router = new express.Router()
const { getCourses, getContentById, getMyCourses, getTotal } = require('../controller/canvasController/canvasController')

router.get('/getcourses', getCourses)
router.get('/getcontentbyid', getContentById)
router.get('/gettotal', getTotal)
// router.post('/getmycourses', getMyCourses)

module.exports = router
