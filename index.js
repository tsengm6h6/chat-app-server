const express = require('express')
const cors = require('cors')
const mongoose = require("mongoose")
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const messageRoutes = require('./routes/messageRoutes')
const roomRoutes = require('./routes/roomRoutes')

const app = express()
require('dotenv').config()

const corsOptions = {
  origin: process.env.CLIENT_URL
};

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/message', messageRoutes)
app.use('/api/room', roomRoutes)

app.get('/', (req, res) => {
  res.send('Hi there!')
})

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB connection Success"))
  .catch((err) => console.log('DB connection Error', err.message))

const server = app.listen(process.env.PORT, () => {
  console.log(`App is listening to port ${process.env.PORT}`)
})

// socket.io
const io = require('socket.io')(server, { cors: corsOptions })

const onlineUsers = {}

io.on('connection', socket => {

  socket.on('add-user', (userId) => {
    console.log('=== add user ===', userId, socket.id)
    onlineUsers[userId] = socket.id
  })

  socket.on('enter-room', roomData => {
    const { room, user } = roomData
    // 檢查是否已有房間
    const currentRoom = Object.keys(socket.rooms).find(room => room !== socket.id)
    // 若有，則先離開
    if (currentRoom) {
      socket.leave(currentRoom)
    }
    // 加入新的
    socket.join(room)
    socket.to(room).emit('user-join-room', `${user} 已加入聊天室`) // 除了自己以外的人接收到訊息
    // io.sockets.in(room).emit('user-join-room', `${user} 已加入聊天室`) // 發送給在 room 中所有的 Client
  })

  socket.on('leave-room', roomData => {
    const { room, user } = roomData
    socket.to(room).emit('user-leave-room', `${user} 已離開聊天室`) // 除了自己以外的人接收到訊息
  })

  socket.on('user-typing', ({ user, type, from, to }) => {
    const target = type === 'room' ? to : onlineUsers[to]
    socket.to(target).emit('receive-typing', {
      message: `${user} is typing`,
      type,
      from
    })
  })

  socket.on('input-message', messageData => {
    console.log('server get input', messageData)
    const socketId = onlineUsers[messageData.to]
    if (messageData.type === 'room') {
      socket.to(messageData.to).emit('client-receive-msg', messageData)
    } else {
      socket.to(socketId).emit('client-receive-msg', messageData)
    }
  })

  socket.on('logout', (userId) => {
    delete onlineUsers[userId]
  })

  socket.on('disconnect', () => {
    console.log('server user disconnected')
  })
})

module.exports = app;