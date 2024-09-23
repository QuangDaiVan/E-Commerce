const router = require('express').Router()
const productController = require('../controllers/product')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')
const uploader = require('../config/cloudinary.config')

router.post('/', [verifyAccessToken, isAdmin], productController.createProduct)
router.get('/', productController.getProducts)

router.put('/ratings', [verifyAccessToken], productController.ratings)

router.put('/:pid', [verifyAccessToken, isAdmin], productController.updateProduct)
router.delete('/:pid', [verifyAccessToken, isAdmin], productController.deleteProduct)
router.get('/:pid', productController.getProduct)
router.put('/upload/:pid', [verifyAccessToken, isAdmin], uploader.array('image', 10), productController.uploadImagesProduct)


module.exports = router