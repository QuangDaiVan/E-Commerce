const userRouter = require('../routes/user')
const productRouter = require('../routes/product')
const productCategoryRouter = require('../routes/productCategory')
const blogCategoryRouter = require('../routes/blogCategory')
const blogRouter = require('../routes/blog')
const brandRouter = require('../routes/brand')
const couponRouter = require('../routes/coupon')
const orderRouter = require('../routes/order')
const insertRouter = require('../routes/insert')
const { notFound, errHandler } = require('../middlewares/errorHandler')

const initRoutes = (app) => {
    app.use('/api/user', userRouter)
    app.use('/api/product', productRouter)
    app.use('/api/productCategory', productCategoryRouter)
    app.use('/api/blogCategory', blogCategoryRouter)
    app.use('/api/blog', blogRouter)
    app.use('/api/brand', brandRouter)
    app.use('/api/coupon', couponRouter)
    app.use('/api/order', orderRouter)
    app.use('/api/insert', insertRouter)


    app.use(notFound)
    app.use(errHandler)
}

module.exports = initRoutes