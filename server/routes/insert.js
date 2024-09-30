const router = require('express').Router()
const insert = require('../controllers/insertData')

router.post('/pro', insert.insertProduct)
router.post('/cate', insert.insertCate)

module.exports = router