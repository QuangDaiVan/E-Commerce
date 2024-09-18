const router = require('express').Router()
const userController = require('../controllers/user')
const { verifyAccessToken } = require('../middlewares/verifyToken')

router.post('/register', userController.register)
router.post('/login', userController.login)
router.get('/logout', userController.logout)
router.get('/current', verifyAccessToken, userController.getCurrent)
router.get('/forgotpassword', userController.forgotPassword)
router.post('/refreshtoken', userController.refreshAccessToken)
router.put('/resetpassword', userController.resetPassword)

module.exports = router