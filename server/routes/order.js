const router = require('express').Router()
const orderController = require('../controllers/order')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.get('/', [verifyAccessToken], orderController.getUserOrder)
router.get('/admin', [verifyAccessToken, isAdmin], orderController.getAllOrders)
router.post('/', [verifyAccessToken], orderController.createOrder)
router.put('/status/:oid', [verifyAccessToken, isAdmin], orderController.updateStatus)


module.exports = router