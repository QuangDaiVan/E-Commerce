const router = require('express').Router()
const userController = require('../controllers/user')
const { verifyAccessToken } = require('../middlewares/verifyToken')

router.post('/register', userController.register)
router.post('/login', userController.login)
router.get('/current', verifyAccessToken, userController.getCurrent)

module.exports = router