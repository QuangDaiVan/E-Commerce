const router = require('express').Router()
const productCategoryController = require('../controllers/productCategory')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/', [verifyAccessToken, isAdmin], productCategoryController.createCategory)
router.get('/', productCategoryController.getCategories)
router.put('/:pcid', [verifyAccessToken, isAdmin], productCategoryController.updateCategory)
router.delete('/:pcid', [verifyAccessToken, isAdmin], productCategoryController.deleteCategory)


module.exports = router