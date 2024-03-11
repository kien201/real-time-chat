const mongoose = require('mongoose')

const RoomSchema = new mongoose.Schema({
    name: String,
    type: { type: String, default: 'chat' }, // chat or group
    members: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
        },
    ],
    messages: [
        {
            sender: { type: mongoose.Schema.ObjectId, ref: 'User' },
            content: String,
            sendTime: Date,
        },
    ],
})

const Room = mongoose.model('Room', RoomSchema)

module.exports = Room
