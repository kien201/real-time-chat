const express = require('express')
const User = require('../models/User')
const Room = require('../models/Room')
const createHttpError = require('http-errors')
const authentication = require('../utils/authentication')
const upload = require('../utils/upload')

const router = express.Router()

router.use(authentication.CheckAuthenticate)

router.get('/getcurrentuser', (req, res) => {
    res.json(req.session.currentUser)
})

router.post('/logout', async (req, res, next) => {
    res.clearCookie('token')
    req.session.currentUser = undefined
    res.json({ message: 'Đăng xuất thành công' })
})

router.get('/', async (req, res, next) => {
    try {
        const users = await User.find()
        res.json(users)
    } catch (error) {
        next(error)
    }
})

router.get('/findbyname', async (req, res, next) => {
    try {
        const user = await User.find({ fullName: { $regex: req.query.name ?? '', $options: 'i' } })
        res.json(user)
    } catch (error) {
        next(error)
    }
})

router.post('/', upload.single('avatar'), async (req, res, next) => {
    try {
        const user = new User(req.body)
        if (req.file) user.avatar = req.file.filename
        await user.save()
        res.json(user)
    } catch (error) {
        if (error.code === 11000) return next(createHttpError('Tài khoản đã tồn tại'))
        next(error)
    }
})

router.put('/:id', upload.single('avatar'), async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
        Object.assign(user, req.body)
        if (req.file) user.avatar = req.file.filename
        await user.save()
        res.json(user)
    } catch (error) {
        next(error)
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        await User.findByIdAndDelete(req.params.id)
        await Room.deleteMany({ type: 'chat', members: req.params.id })
        await Room.updateMany({ type: 'group', members: req.params.id }, { $pull: { members: req.params.id } })
        res.json({ message: 'Xoá thành công' })
    } catch (error) {
        next(error)
    }
})

module.exports = router
