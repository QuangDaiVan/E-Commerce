const User = require('../models/user')
const asyncHandler = require('express-async-handler')
const { generateAccsessToken, generateRefreshToken } = require('../middlewares/jwt')
const jwt = require('jsonwebtoken')
const sendMail = require('../ultils/sendMail')
const crypto = require('crypto')


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
            result: newUser ? 'Register is successfully. Please go login!' : 'Something went wrong!'
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
        const { password, role, refreshToken, ...userData } = response.toObject()
        // tạo access Token
        const accessToken = generateAccsessToken(response._id, role)
        // tạo refresh Token
        const newRefreshToken = generateRefreshToken(response._id)
        // lưu refreshToken vào trong database
        await User.findByIdAndUpdate(response._id, { refreshToken: newRefreshToken }, { new: true })
        // lưu refresh token vào trong cookie
        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, maxAge: 14 * 24 * 60 * 60 * 1000 })
        return res.status(200).json(({
            success: true,
            accessToken: accessToken,
            result: userData
        }))
    } else {
        throw new Error('Invalid credentials!')
    }
})

const logout = asyncHandler(async (req, res) => {
    // check xem trong cookie có refresh token hay không
    const cookie = req.cookies
    if (!cookie && !cookie.refreshToken) {
        throw new Error('No refresh token in cookies')
    }
    // xóa refresh token ở db bằng hàm cập nhập nó thành 1 chuỗi rỗng
    await User.findOneAndUpdate({ refreshToken: cookie.refreshToken }, { refreshToken: '' }, { new: true })
    // xóa refresh token ở cookies trên trình duyệt
    res.clearCookie('refreshToken', { httpOnly: true, secure: true })
    return res.status(200).json({
        success: true,
        result: 'Logout is done'
    })
})

const getCurrent = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const user = await User.findById(_id).select('-refreshToken -password -role')
    return res.status(200).json({
        success: user ? true : false,
        result: user ? user : 'User not found!'
    })
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    // lấy token từ cookies
    const cookie = req.cookies
    // kiểm tra xem có token hay không
    if (!cookie && !cookie.refreshToken) {
        throw new Error('No refresh token in cookies')
    }
    // check xem token có hợp lệ hay không
    const result = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET)
    const response = await User.findOne({ _id: result._id, refreshToken: cookie.refreshToken })
    return res.status(200).json({
        success: response ? true : false,
        newAccessToken: response ? generateAccsessToken(response._id, response.role) : 'Refresh token not matched'
        // jwt.verify(cookie.refreshToken, process.env.JWT_SECRET, async (err, decode) => {
        //     if (err) { throw new Error('Invalid refresh token') }
        //     // check xem token có khớp với token đã lưu trong db hay không
        //     const response = await User.findById({ _id: decode._id, refreshToken: cookie.refreshToken })
        //     return res.status(200).json({
        //         success: response ? true : false,
        //         newAccessToken: response ? generateAccsessToken(response._id, response.role) : 'Refresh token not matched'
        //     })
    })
})

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.query
    if (!email) {
        throw new Error('Missing email!')
    }
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('User not found!')
    }
    const resetToken = user.createPasswordChangeToken()
    await user.save()

    // gửi mail
    const html = `Xin vui lòng click vào link dưới đây để thay đổi mật khẩu của bạn. Link này sẽ hết hạn sau 15 phút kể từ bây giờ. 
    <a href=${process.env.URL_SERVER}/api/user/reset-password/${resetToken}>Click here</a>`

    const data = {
        email,
        html
    }
    const result = await sendMail(data)
    return res.status(200).json({
        success: true,
        result: result
    })
})

const resetPassword = asyncHandler(async (req, res) => {
    const { password, token } = req.body
    if (!password || !token) { throw new Error('Missing inputs') }
    const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({ passwordResetToken, passwordResetExpires: { $gt: Date.now() } })
    if (!user) { throw new Error('Invalid reset token') }
    user.password = password
    user.passwordResetToken = undefined
    user.passwordChangeAt = Date.now()
    user.passwordResetExpires = undefined
    await user.save()
    return res.status(200).json({
        success: user ? true : false,
        result: user ? 'Updated password!' : 'Something went wrong!'
    })
})

const getAllUsers = asyncHandler(async (req, res) => {
    const response = await User.find().select('-refreshToken -password -role')
    return res.status(200).json({
        success: response ? true : false,
        result: response
    })
})

const deleteUser = asyncHandler(async (req, res) => {
    const { _id } = req.query
    if (!_id) { throw new Error('Missing inputs') }
    const response = await User.findByIdAndDelete(_id)
    return res.status(200).json({
        success: response ? true : false,
        result: response ? `User with email ${response.email} deleted` : 'No user deleted'
    })
})

const updateUser = asyncHandler(async (req, res) => {
    const { _id } = req.user
    if (!_id || Object.keys(req.body).length === 0) { throw new Error('Missing inputs') }
    const response = await User.findByIdAndUpdate(_id, req.body, { new: true }).select('-refreshToken -password -role')
    return res.status(200).json({
        success: response ? true : false,
        result: response ? response : 'Something went wrong'
    })
})

const updateUserByAdmin = asyncHandler(async (req, res) => {
    const { uid } = req.params
    if (Object.keys(req.body).length === 0) { throw new Error('Missing inputs') }
    const response = await User.findByIdAndUpdate(uid, req.body, { new: true }).select('-refreshToken -password -role')
    return res.status(200).json({
        success: response ? true : false,
        result: response ? response : 'Something went wrong'
    })
})


module.exports = {
    register,
    login,
    getCurrent,
    refreshAccessToken,
    logout,
    forgotPassword,
    resetPassword,
    getAllUsers,
    deleteUser,
    updateUser,
    updateUserByAdmin
}