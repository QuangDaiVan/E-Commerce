const Coupon = require('../models/coupon')
const asyncHandler = require('express-async-handler')

const createCoupon = asyncHandler(async (req, res) => {
    const { name, discount, expiry } = req.body
    if (!name || !discount || !expiry) { throw new Error('Missing inputs') }
    const response = await Coupon.create({
        ...req.body,
        expiry: Date.now() + expiry * 24 * 60 * 60 * 1000
    })
    return res.status(200).json({
        success: response ? true : 'Cannot create new coupon',
        result: response
    })
})
const getCoupons = asyncHandler(async (req, res) => {
    const response = await Coupon.find()
    return res.status(200).json({
        success: response ? true : false,
        result: response ? response : 'Cannot get coupons'
    })
})
const updateCoupon = asyncHandler(async (req, res) => {
    const { cid } = req.params
    if (Object.keys(req.body).length === 0) { throw new Error('Missing inputs') }
    if (req.body.expiry) { req.body.expiry = Date.now() + req.body.expiry * 24 * 60 * 60 * 1000 }
    const response = await Coupon.findByIdAndUpdate(cid, req.body, { new: true })
    return res.status(200).json({
        success: response ? true : false,
        result: response ? response : 'Cannot update coupon'
    })
})
const deleteCoupon = asyncHandler(async (req, res) => {
    const { cid } = req.params
    const response = await Coupon.findByIdAndDelete(cid)
    return res.status(200).json({
        success: response ? true : false,
        result: response ? response : 'Cannot delete coupon'
    })
})

module.exports = {
    createCoupon,
    getCoupons,
    updateCoupon,
    deleteCoupon
}