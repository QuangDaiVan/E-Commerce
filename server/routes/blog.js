const router = require('express').Router()
const blogController = require('../controllers/blog')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/', [verifyAccessToken, isAdmin], blogController.createBlog)
router.get('/', blogController.getBlogs)

router.put('/likes/:bid', [verifyAccessToken], blogController.likeBlog)
router.put('/dislike/:bid', [verifyAccessToken], blogController.dislikeBlog)
router.put('/:bid', [verifyAccessToken, isAdmin], blogController.updateBlog)
router.delete('/:bid', [verifyAccessToken, isAdmin], blogController.deleteBlog)


module.exports = router