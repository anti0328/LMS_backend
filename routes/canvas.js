const express = require('express')
const router = new express.Router()
const { getCourses, getContentById, getMyCourses } = require('../controller/canvasController/canvasController')

router.get('/getcourses', getCourses)
router.get('/getcontentbyid', getContentById)
// router.post('/getmycourses', getMyCourses)

module.exports = router
