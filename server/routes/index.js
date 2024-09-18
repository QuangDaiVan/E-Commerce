const userRouter = require('../routes/user')
const productRouter = require('../routes/product')
const { notFound, errHandler } = require('../middlewares/errorHandler')

const initRoutes = (app) => {
    app.use('/api/user', userRouter)
    app.use('/api/product', productRouter)


    app.use(notFound)
    app.use(errHandler)
}

module.exports = initRoutes