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

let onlineUsers = []

io.on('connection', socket => {

  socket.on('USER_ONLINE', (newUserId) => {
    console.log('=== user-online ===', newUserId, socket.id)
    if (!onlineUsers.some(({ userId }) => userId === newUserId)) {
      onlineUsers.push({
        userId: newUserId, 
        socketId: socket.id
      })
      socket.broadcast.emit('ONLINE_USER_CHANGED', onlineUsers)
    }
  })

  // socket.on('USER_OFFLINE', (userId) => {
  //   onlineUsers = onlineUsers.filter(({ userId }) => userId !== userId)
  //   io.emit('ONLINE_USER_CHANGED', onlineUsers)
  // })

  socket.on('disconnect', () => {
    onlineUsers = onlineUsers.filter(({ userId }) => userId !== userId)
    io.emit('ONLINE_USER_CHANGED', onlineUsers)
    console.log('server user disconnected')
  })

  socket.on('SEND_MESSAGE', (messageData) => {
    const { type, message, senderId, receiverId } = messageData
    if (type === 'room') {
      socket.to(receiverId).emit('RECEIVE_MESSAGE', messageData)
    } else {
      const receiver = onlineUsers.find(({ userId }) => userId === receiverId)
      if (receiver) {
        socket.to(receiver.socketId).emit('RECEIVE_MESSAGE', messageData)
      }
    }
  })

  socket.on('USER_TYPING', ({ type, senderId, receiverId }) => {
    if (type === 'room') {
      socket.to(receiverId).emit('TYPING_NOTIFY')
    } else {
      const receiver = onlineUsers.find(({ userId }) => userId === receiverId)
      if (receiver) {
        socket.to(receiver.socketId).emit('TYPING_NOTIFY')
      }
    }
  })

  socket.on('ENTER_CHAT_ROOM', roomData => {
    const { roomId, enterUserId } = roomData
    // 檢查是否已有房間
    const currentRoom = Object.keys(socket.rooms).find(room => room !== socket.id)
    // 若有，則先離開
    if (currentRoom) {
      socket.leave(currentRoom)
    }
    // 加入新的
    socket.join(roomId)
    socket.to(roomId).emit('NEW_USER_JOIN_GROUP_CHAT', {
      joinId: enterUserId
    }) // 除了自己以外的人接收到訊息
    // io.sockets.in(room).emit('user-join-room', `${user} 已加入聊天室`) // 發送給在 room 中所有的 Client
  })

  socket.on('LEAVE_CHAT_ROOM', roomData => {
    const { roomId, leaveUserId } = roomData
    // // 檢查是否已有房間
    // const currentRoom = Object.keys(socket.rooms).find(room => room !== socket.id)
    // // 若有，則先離開
    // if (currentRoom) {
    //   socket.leave(currentRoom)
    // }
    socket.to(roomId).emit('USER_LEAVE_CHAT_ROOM', {
      leaveId: leaveUserId
    }) // 除了自己以外的人接收到訊息
    socket.leave(roomId)
  })
})

module.exports = app;