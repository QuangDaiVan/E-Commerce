const router = require('express').Router()
const userController = require('../controllers/user')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/register', userController.register)
router.post('/login', userController.login)
router.get('/logout', userController.logout)
router.get('/current', [verifyAccessToken], userController.getCurrent)
router.get('/forgotpassword', userController.forgotPassword)
router.get('/getallusers', [verifyAccessToken, isAdmin], userController.getAllUsers)
router.post('/refreshtoken', userController.refreshAccessToken)
router.put('/resetpassword', userController.resetPassword)
router.delete('/deleteuser', [verifyAccessToken, isAdmin], userController.deleteUser)
router.put('/updateuser', [verifyAccessToken], userController.updateUser)
router.put('/:uid', [verifyAccessToken, isAdmin], userController.updateUserByAdmin)
router.put('/address', [verifyAccessToken], userController.addAddress)
router.put('/cart/addProduct', [verifyAccessToken], userController.addProductIntoCart)

module.exports = router