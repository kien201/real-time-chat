const mongoose = require('mongoose')

function notBlank(value) {
    return value.trim().length > 0
}

const userSchema = new mongoose.Schema({
    fullName: String,
    username: { type: String, unique: true },
    password: String,
    avatar: String,
})

const User = mongoose.model('User', userSchema)

module.exports = User
