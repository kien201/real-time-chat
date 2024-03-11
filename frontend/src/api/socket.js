import { io } from 'socket.io-client'

const socket = io(process.env.REACT_APP_API_URL, { withCredentials: true })

socket.on('connect_error', (err) => {
    console.log(err) // prints the message associated with the error
})

export default socket
