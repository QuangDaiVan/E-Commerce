const { query } = require('express')
const Product = require('../models/product')
const asyncHandler = require('express-async-handler')
const slugify = require('slugify')

const createProduct = asyncHandler(async (req, res) => {
    if (Object.keys(req.body).length === 0) { throw new Error('Missing inputs') }
    if (req.body && req.body.title) {
        req.body.slug = slugify(req.body.title)
    }
    const newProduct = await Product.create(req.body)
    return res.status(200).json({
        success: newProduct ? true : false,
        createdProduct: newProduct ? newProduct : 'Cannot create new product'
    })
})

const getProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params
    const product = await Product.findById(pid)
    return res.status(200).json({
        success: product ? true : false,
        productData: product ? product : 'Cannot get product'
    })
})

// Filtering, sorting, pagination
const getProducts = asyncHandler(async (req, res) => {
    const queries = { ...req.query }
    // tách các trường đặc biệt ra khỏi query
    const excludeFields = ['limit', 'sort', 'page', 'fields',]
    excludeFields.forEach(element => delete queries[element])

    // Format lại các operators cho đúng cú pháp với mongoose
    const queryString = JSON.stringify(queries).replace(/\b(gte|gt|lt|lte)\b/g, matchedElement => `$${matchedElement}`)
    // queryString.replace(/\b(gte|gt|lt|lte)\b/g, matchedElement => `$${matchedElement}`)
    const formatedQueries = JSON.parse(queryString)

    // Filtering: https://blog.jeffdevslife.com/p/1-mongodb-query-of-advanced-filtering-sorting-limit-field-and-pagination-with-mongoose/
    // lọc ra theo yêu cầu của client
    if (queries?.title) {
        formatedQueries.title = { $regex: queries.title, $options: 'i' }
    }
    let queryCommand = Product.find(formatedQueries)

    // Sorting: sắp xếp theo 1 yêu cầu của client
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ')
        queryCommand.sort(sortBy)
    }
    // Fields limiting:
    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ')
        queryCommand = queryCommand.select(fields)
    }
    // Pagination: chỉ định số lượng phần tử của 1 page(1 lần gọi API)
    const page = +req.query.page || 1
    const limit = +req.query.limit || process.env.LIMIT_PRODUCTS_PER_PAGE
    const skip = (page - 1) * limit
    queryCommand.skip(skip).limit(limit)


    // Execute query
    // số lượng sản phẩm thỏa mãn điều kiện khác với số lượng sản phẩm trả về 1 lần gọi API
    // hiện không hỗ trợ callback nên dùng promise như bên dưới
    // queryCommand.exec(async (err, response) => {
    //     if (err) { throw new Error(err.message) }
    //     const counts = await Product.find(formatedQueries).countDocuments()
    //     return res.status(200).json({
    //         success: response ? true : false,
    //         products: response ? response : 'Cannot get products',
    //         counts: counts
    //     })
    // })
    queryCommand.exec()
        .then(async (response) => {
            const counts = await Product.find(formatedQueries).countDocuments()
            return res.status(200).json({
                success: response.length ? true : false,
                products: response.length ? response : 'Cannot find products',
                counsts: counts
            })
        })
    // .then()
    // .then(async (response, err) => {
    //     const counts = await Product.find(formatedQueries).countDocuments()
    //     return res.status(200).json({
    //         success: response ? true : false,
    //         products: response ? response : 'Cannot find products',
    //         counsts: counts
    //     })
    // })
    // .catch(err => err)
})
const updateProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params
    if (req.body && req.body.title) { req.body.slug = slugify(req.body.title) }
    const updatedProduct = await Product.findByIdAndUpdate(pid, req.body, { new: true })
    return res.status(200).json({
        success: updatedProduct ? true : false,
        updatedProduct: updatedProduct ? updatedProduct : 'Cannot update product'
    })
})
const deleteProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params
    const deletedProduct = await Product.findByIdAndDelete(pid)
    return res.status(200).json({
        success: deletedProduct ? true : false,
        deletedProduct: deletedProduct ? deletedProduct : 'Cannot delete product'
    })
})


module.exports = {
    createProduct,
    getProduct,
    getProducts,
    updateProduct,
    deleteProduct
}