require('dotenv').config()
const http = require('http')
const express = require('express')
const path = require('path')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const { Server: socketIO } = require('socket.io')
const mongoose = require('mongoose')
const authentication = require('./utils/authentication')
const homeRouter = require('./routes/home')
const userRouter = require('./routes/user')
const roomRouter = require('./routes/room')
const Room = require('./models/Room')

mongoose.connect(process.env.MONGODB_CONNECTION).then(() => console.log('Database connected!'))

const app = express()
const cookieMiddleware = cookieParser()
const sessionMiddleware = session({
    secret: 'secret',
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
    resave: false,
    saveUninitialized: true,
})
const corsOptions = { origin: [process.env.FRONTEND_URL], credentials: true }

app.use(cors(corsOptions))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieMiddleware)
app.use(sessionMiddleware)

// authentication
app.use(authentication.Authenticate)

app.use('/', homeRouter)
app.use('/user', userRouter)
app.use('/room', roomRouter)

// error handler
app.use(function (err, req, res, next) {
    res.status(err.status || 500).json(err)
})

const server = http.createServer(app)
const io = new socketIO(server, { cors: corsOptions })
// io.engine.use(cookieMiddleware)
// io.engine.use(sessionMiddleware)
// io.engine.use(authentication.Authenticate)

io.on('connection', (socket) => {
    console.log(`Connected id: ${socket.id}`)

    socket.on('send-message', async (data) => {
        try {
            const message = { sender: data.senderId, content: data.message, sendTime: new Date() }

            let room
            if (data.hasRoom) {
                room = await Room.findById(data.receiverId)
            } else {
                room = new Room({ members: [data.senderId, data.receiverId] })
            }
            room.messages.push(message)
            await room.save()
            const updatedRoom = (await room.populate(['members', 'messages.sender'])).toObject()

            io.to(updatedRoom.members.map((member) => member._id.toString())).emit('receive-room-update', {
                ...updatedRoom,
                messages: updatedRoom.messages.slice(-1),
            })
        } catch (error) {
            console.log(error)
        }
    })

    socket.on('edit-room', async (data) => {
        let room
        if (data.hasRoom) {
            room = await Room.findById(data._id)
        } else {
            room = new Room({ type: 'group' })
        }
        room.name = data.name
        room.members = data.members
        await room.save()
        const updatedRoom = (await room.populate(['members', 'messages.sender'])).toObject()

        io.to(updatedRoom.members.map((member) => member._id.toString())).emit('receive-room-update', {
            ...updatedRoom,
            messages: [],
        })
    })

    socket.on('join-room', (room) => {
        socket.join(room)
    })

    socket.on('leave-room', (room) => {
        socket.leave(room)
    })

    socket.on('disconnect', () => {
        console.log(`Disconnected id: ${socket.id}`)
    })
})

const port = process.env.PORT
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})
