const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const createHttpError = require('http-errors')

const router = express.Router()

router.post('/login', async (req, res, next) => {
    const { username, password } = req.body
    const user = await User.findOne({ username, password })
    if (!user) return next(createHttpError(401, 'Thông tin tài khoản hoặc mật khẩu không chính xác'))
    const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, { expiresIn: '30d' })
    res.cookie('token', token, { httpOnly: true, maxAge: 30 * 24 * 3600 * 1000 })
    req.session.currentUser = user
    res.json({ message: 'Đăng nhập thành công', token })
})

router.post('/register', async (req, res, next) => {
    try {
        const user = new User(req.body)
        await user.save()

        const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, { expiresIn: '30d' })
        res.cookie('token', token, { httpOnly: true, maxAge: 30 * 24 * 3600 * 1000 })
        req.session.currentUser = user
        res.json({ message: 'Đăng ký thành công', token })
    } catch (error) {
        if (error.code === 11000) return next(createHttpError('Tài khoản đã có người đăng ký'))
        next(error)
    }
})

module.exports = router
