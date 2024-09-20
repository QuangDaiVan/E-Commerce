const { query } = require('express')
const Product = require('../models/product')
const asyncHandler = require('express-async-handler')
const slugify = require('slugify')

// Tạo mới 1 sản phầm, cần role admin
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

// lấy ra 1 sản phẩm
const getProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params
    const product = await Product.findById(pid)
    return res.status(200).json({
        success: product ? true : false,
        productData: product ? product : 'Cannot get product'
    })
})

// lấy ra nhiều sản phẩm bằng cách lọc, sắp xếp, phân trang và xóa 1 vài trường hiển thị(làm card cho trello)
const getProducts = asyncHandler(async (req, res) => {

    const queries = { ...req.query }
    console.log('🚀 ~ getProducts ~ queries:', queries)

    // tách các trường đặc biệt ra khỏi query
    const excludeFields = ['limit', 'sort', 'page', 'fields',]
    excludeFields.forEach(element => delete queries[element])

    // Format lại các operators cho đúng cú pháp với mongoose
    const queryString = JSON.stringify(queries).replace(/\b(gte|gt|lt|lte)\b/g, matchedElement => `$${matchedElement}`)
    // queryString.replace(/\b(gte|gt|lt|lte)\b/g, matchedElement => `$${matchedElement}`)
    const formatedQueries = JSON.parse(queryString)
    console.log('🚀 ~ getProducts ~ formatedQueries:', formatedQueries)

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
    queryCommand.exec()
        .then(async (response) => {
            const counts = await Product.find(formatedQueries).countDocuments()
            return res.status(200).json({
                success: response.length ? true : false,
                products: response.length ? response : 'Cannot find products',
                counsts: counts
            })
        })
})

// update 1 sản phẩm, cần role admin
const updateProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params
    if (req.body && req.body.title) { req.body.slug = slugify(req.body.title) }
    const updatedProduct = await Product.findByIdAndUpdate(pid, req.body, { new: true })
    return res.status(200).json({
        success: updatedProduct ? true : false,
        updatedProduct: updatedProduct ? updatedProduct : 'Cannot update product'
    })
})

// xóa 1 sản phẩm, cần role admin
const deleteProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params
    const deletedProduct = await Product.findByIdAndDelete(pid)
    return res.status(200).json({
        success: deletedProduct ? true : false,
        deletedProduct: deletedProduct ? deletedProduct : 'Cannot delete product'
    })
})

const ratings = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const { star, comment, pid } = req.body
    if (!star || !pid) { throw new Error('Missing inputs') }
    const ratingProduct = await Product.findById(pid)
    const alreadyRating = ratingProduct?.ratings?.find(element => element.postedBy.toString() === _id)

    // xử lý 2 trường hợp của rating
    if (alreadyRating) {
        // update star and comment
        await Product.updateOne(
            { ratings: { $elemMatch: alreadyRating } },
            { $set: { "ratings.$.star": star, "ratings.$.comment": comment } },
            { new: true }
        )
    } else {
        // add star and comment
        await Product.findByIdAndUpdate(pid, {
            $push: { ratings: { star, comment, postedBy: _id } }
        }, { new: true })
    }
    return res.status(200).json({
        status: true
    })
})

module.exports = {
    createProduct,
    getProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    ratings
}