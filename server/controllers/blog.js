const Blog = require('../models/blog')
const asyncHandler = require('express-async-handler')

const createBlog = asyncHandler(async (req, res) => {
    const { title, description, category } = req.body
    if (!title || !description | !category) { throw new Error('Missing inputs') }
    const response = await Blog.create(req.body)
    return res.status(200).json({
        success: response ? true : false,
        createdBlog: response ? response : 'Cannot create new blog'
    })
})
const getBlogs = asyncHandler(async (req, res) => {
    const response = await Blog.find().select('title description category')
    return res.status(200).json({
        success: response ? true : false,
        blogs: response ? response : 'Cannot get blogs'
    })
})
const updateBlog = asyncHandler(async (req, res) => {
    const { bid } = req.params
    if (Object.keys(req.body).length === 0) { throw new Error('Missing inputs') }
    const response = await Blog.findByIdAndUpdate(bid, req.body, { new: true })
    return res.status(200).json({
        success: response ? true : false,
        updatedBlog: response ? response : 'Cannot update blog'
    })
})
const deleteBlog = asyncHandler(async (req, res) => {
    const { bid } = req.params
    const response = await Blog.findByIdAndDelete(bid)
    return res.status(200).json({
        success: response ? true : false,
        deletedBlog: response ? response : 'Cannot delete blog'
    })
})

// về việc bày tỏ cảm xúc thì sẽ có 3 trạng thái là empty, like, dislike
// default là empty
// khi người dùng bấm vào like hoặc dislike thì cần check xem người đó trước đó đã dislike hay like chưa
// nếu chưa thì chỉ cần set like hoặc dislike là được
// nếu trước đó dislike mà giờ bấm like thì cần xóa dislike đi trước và chuyển thành like. 
// Nếu trước dislike mà giờ bấm dislike thì là đưa về empty
// xử lý like tương tự dislike

const likeBlog = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const { bid } = req.params

    if (!bid) { throw new Error('Missing inputs') }

    const blog = await Blog.findById(bid)
    const alreadyDisliked = blog?.dislikes?.find(element => element.toString() === _id)

    if (alreadyDisliked) {
        const response = await Blog.findByIdAndUpdate(bid, { $pull: { dislikes: _id } }, { new: true })
        return res.status(200).json({
            success: response ? true : false,
            result: response
        })
    }
    const isLiked = blog?.likes?.find(element => element.toString() === _id)
    if (isLiked) {
        const response = await Blog.findByIdAndUpdate(bid, { $pull: { likes: _id } }, { new: true })
        return res.status(200).json({
            success: response ? true : false,
            result: response
        })
    } else {
        const response = await Blog.findByIdAndUpdate(bid, { $push: { likes: _id } }, { new: true })
        return res.status(200).json({
            success: response ? true : false,
            result: response
        })
    }
})
const dislikeBlog = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const { bid } = req.params

    if (!bid) { throw new Error('Missing inputs') }

    const blog = await Blog.findById(bid)
    const alreadyLiked = blog?.likes?.find(element => element.toString() === _id)

    if (alreadyLiked) {
        const response = await Blog.findByIdAndUpdate(bid, { $pull: { likes: _id } }, { new: true })
        return res.status(200).json({
            success: response ? true : false,
            result: response
        })
    }
    const isDisLiked = blog?.dislikes?.find(element => element.toString() === _id)
    if (isDisLiked) {
        const response = await Blog.findByIdAndUpdate(bid, { $pull: { dislikes: _id } }, { new: true })
        return res.status(200).json({
            success: response ? true : false,
            result: response
        })
    } else {
        const response = await Blog.findByIdAndUpdate(bid, { $push: { dislikes: _id } }, { new: true })
        return res.status(200).json({
            success: response ? true : false,
            result: response
        })
    }
})

module.exports = { createBlog, getBlogs, updateBlog, deleteBlog, likeBlog, dislikeBlog }