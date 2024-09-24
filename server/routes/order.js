const router = require('express').Router()
const orderController = require('../controllers/order')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/', [verifyAccessToken], orderController.createOrder)


module.exports = router