const router = require('express').Router()
const couponController = require('../controllers/coupon')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/', [verifyAccessToken, isAdmin], couponController.createCoupon)
router.get('/', couponController.getCoupons)
router.put('/:cid', [verifyAccessToken, isAdmin], couponController.updateCoupon)
router.delete('/:cid', [verifyAccessToken, isAdmin], couponController.deleteCoupon)

module.exports = router