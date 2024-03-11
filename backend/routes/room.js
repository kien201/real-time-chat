const express = require('express')
const Room = require('../models/Room')
const User = require('../models/User')
const authentication = require('../utils/authentication')
const mongoose = require('mongoose')

const router = express.Router()

router.use(authentication.CheckAuthenticate)

router.get('/', async (req, res, next) => {
    try {
        const rooms = await Room.find()
        res.json(rooms)
    } catch (error) {
        next(error)
    }
})

router.get('/memberroom', async (req, res, next) => {
    try {
        const rooms = await Room.find(
            { members: { $elemMatch: { $eq: req.session.currentUser._id } } },
            { messages: { $slice: -20 } }
        ).populate(['members', 'messages.sender'])
        res.json(rooms)
    } catch (error) {
        next(error)
    }
})

router.get('/:id/previousmessage', async (req, res, next) => {
    try {
        const { messageId, pageSize } = req.query
        const rooms = await Room.findById(req.params.id).populate(['members', 'messages.sender'])
        const messages = rooms.messages
            .filter((message) => {
                const messageTimestamp = new mongoose.Types.ObjectId(message._id).getTimestamp()
                const currentMessageTimestamp = new mongoose.Types.ObjectId(messageId).getTimestamp()
                return messageTimestamp < currentMessageTimestamp
            })
            .slice(-pageSize)

        res.json(messages)
    } catch (error) {
        next(error)
    }
})

router.post('/', async (req, res, next) => {
    try {
        const room = new Room(req.body)
        await room.save()
        res.json(room)
    } catch (error) {
        next(error)
    }
})

router.put('/:id', async (req, res, next) => {
    try {
        const { name } = req.body
        const updatedRoom = await Room.findByIdAndUpdate(req.params.id, { name }, { new: true })
        res.json(updatedRoom)
    } catch (error) {
        next(error)
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        await Room.findByIdAndDelete(req.params.id)
        res.json({ message: 'Xoá thành công' })
    } catch (error) {
        next(error)
    }
})

module.exports = router
