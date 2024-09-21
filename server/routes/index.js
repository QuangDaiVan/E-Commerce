const userRouter = require('../routes/user')
const productRouter = require('../routes/product')
const productCategoryRouter = require('../routes/productCategory')
const blogCategoryRouter = require('../routes/blogCategory')
const blogRouter = require('../routes/blog')
const { notFound, errHandler } = require('../middlewares/errorHandler')

const initRoutes = (app) => {
    app.use('/api/user', userRouter)
    app.use('/api/product', productRouter)
    app.use('/api/productCategory', productCategoryRouter)
    app.use('/api/blogCategory', blogCategoryRouter)
    app.use('/api/blog', blogRouter)


    app.use(notFound)
    app.use(errHandler)
}

module.exports = initRoutes