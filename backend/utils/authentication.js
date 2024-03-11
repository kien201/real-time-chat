const jwt = require('jsonwebtoken')
const User = require('../models/User')
const createHttpError = require('http-errors')

const authentication = {
    Authenticate: async (req, res, next) => {
        try {
            if (req.cookies.token && !req.session.currentUser) {
                const token = req.cookies.token
                const result = jwt.verify(token, process.env.SECRET_KEY)
                const user = await User.findById(result.id)
                req.session.currentUser = user
            }
            next()
        } catch (error) {
            next(error)
        }
    },
    CheckAuthenticate: (req, res, next) => {
        if (req.session.currentUser) next()
        else next(createHttpError(401, 'Bạn chưa đăng nhập'))
    },
}

module.exports = authentication
