const BlogCategory = require('../models/blogCategory')
const asyncHandler = require('express-async-handler')

const createBlogCategory = asyncHandler(async (req, res) => {
    const { title } = req.body
    if (!title) { throw new Error('Missing inputs') }
    const response = await BlogCategory.create(req.body)
    return res.status(200).json({
        success: response ? true : false,
        result: response ? response : 'Cannot create new blog-category'
    })
})
const getBlogCategories = asyncHandler(async (req, res) => {
    const response = await BlogCategory.find().select('title _id')
    return res.status(200).json({
        success: response ? true : false,
        result: response ? response : 'Cannot get blog-categories'
    })
})
const updateBlogCategory = asyncHandler(async (req, res) => {
    const { bcid } = req.params
    if (Object.keys(req.body).length === 0) { throw new Error('Missing inputs') }
    const response = await BlogCategory.findByIdAndUpdate(bcid, req.body, { new: true })
    return res.status(200).json({
        success: response ? true : false,
        result: response ? response : 'Cannot update blog-category'
    })
})
const deleteBlogCategory = asyncHandler(async (req, res) => {
    const { bcid } = req.params
    const response = await BlogCategory.findByIdAndDelete(bcid)
    return res.status(200).json({
        success: response ? true : false,
        result: response ? response : 'Cannot delete blog-category'
    })
})

module.exports = { createBlogCategory, getBlogCategories, updateBlogCategory, deleteBlogCategory }