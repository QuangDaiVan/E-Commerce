const jwt = require('jsonwebtoken')

const generateAccsessToken = (uid, role) => {
    return jwt.sign({ _id: uid, role }, process.env.JWT_SECRET, { expiresIn: '2d' })
}

const generateRefreshToken = (uid) => {
    return jwt.sign({ _id: uid }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

module.exports = { generateAccsessToken, generateRefreshToken }