const User = require('../models/user')
const asyncHandler = require('express-async-handler')
const { generateAccsessToken, generateRefreshToken } = require('../middlewares/jwt')

const register = asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName } = req.body
    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({
            success: false,
            message: 'missing inputs'
        })
    }
    const user = await User.findOne({ email })
    if (user) { throw new Error('User has existed') }
    else {
        const newUser = await User.create(req.body)
        return res.status(200).json({
            success: newUser ? true : false,
            message: newUser ? 'Register is successfully. Please go login!' : 'Something went wrong!'
        })
    }
})
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'missing inputs'
        })
    }
    const response = await User.findOne({ email })

    //refresh token có chức năng cấp mới access token
    // access token có chức năng xác thực người dùng và phân quyền người dùng
    // vì vậy cần check access token
    if (response && await response.isCorrectPassword(password)) {
        // tách password và role ra khỏi response
        const { password, role, ...userData } = response.toObject()
        // tạo access Token
        const accessToken = generateAccsessToken(response._id, role)
        // tạo refresh Token
        const refreshToken = generateRefreshToken(response._id)
        // lưu refreshToken vào trong database
        await User.findByIdAndUpdate(response._id, { refreshToken: refreshToken }, { new: true })
        // lưu refresh token vào trong cookie
        res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 14 * 24 * 60 * 60 * 1000 })
        return res.status(200).json(({
            success: true,
            accessToken: accessToken,
            userData: userData
        }))
    } else {
        throw new Error('Invalid credentials!')
    }
})

module.exports = { register, login }