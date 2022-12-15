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
      // io.emit('ONLINE_USER_CHANGED', onlineUsers)
    }
    console.log('online user', onlineUsers)
    io.emit('ONLINE_USER_CHANGED', onlineUsers)
  })

  socket.on('USER_OFFLINE', (logoutUserId) => {
    onlineUsers = onlineUsers.filter(({ userId }) => userId !== logoutUserId)
    io.emit('ONLINE_USER_CHANGED', onlineUsers)
  })

  socket.on('disconnect', () => {
    console.log('server user disconnected')
  })

  socket.on('SEND_MESSAGE', (messageData) => {
    console.log(messageData)
    const { type, message, senderId, receiverId } = messageData
    if (type === 'room') {
      // socket.to(receiverId).emit('RECEIVE_MESSAGE', messageData)
      socket.broadcast.emit('RECEIVE_MESSAGE', messageData)
    } else {
      console.log('*** onlineUsers *** ***', onlineUsers)
      const receiver = onlineUsers.find(({ userId }) => userId === receiverId)
      if (receiver) {
        console.log('receiver', receiver)
        socket.to(receiver.socketId).emit('RECEIVE_MESSAGE', messageData)
        // io.emit('RECEIVE_MESSAGE', messageData)
      }
    }
  })

  socket.on('UPDATE_MESSAGE_STATUS', ({ type, readerId, messageSender }) => {
    console.log('=== 更新已讀 ===')
    console.table({ type, readerId, messageSender })
    const socketId = type === 'room' 
      ? messageSender 
      : onlineUsers.find(({ userId }) => userId === messageSender)?.socketId

    if (socketId) {
      socket.to(socketId).emit('MESSAGE_READ', { type, readerId, messageSender })
    }
  })

  socket.on('USER_TYPING', ({ type, message, senderId, receiverId }) => {
    if (type === 'room') {
      socket.to(receiverId).emit('TYPING_NOTIFY', { type, message, senderId, receiverId })
    } else {
      const receiver = onlineUsers.find(({ userId }) => userId === receiverId)
      if (receiver) {
        socket.to(receiver.socketId).emit('TYPING_NOTIFY', { type, message, senderId, receiverId })
      }
    }
  })

  socket.on('ENTER_CHAT_ROOM', roomData => {
    const { roomId, message } = roomData
    console.log('room', roomId)
    // 檢查是否已有房間
    const currentRoom = Object.keys(socket.rooms).find(room => room !== socket.id)
    if (currentRoom === roomId) return
    // 若有，則先離開
    if (currentRoom) {
      socket.leave(currentRoom)
    }
    // 加入新的
    socket.join(roomId)
    socket.to(roomId).emit('CHAT_ROOM_NOTIFY', {
      roomId,
      message
    }) // 除了自己以外的人接收到訊息
    // io.sockets.in(room).emit('user-join-room', `${user} 已加入聊天室`) // 發送給在 room 中所有的 Client
  })

  socket.on('LEAVE_CHAT_ROOM', roomData => {
    const { roomId, message } = roomData
    console.log('leave room', roomId)
    // // 檢查是否已有房間
    // const currentRoom = Object.keys(socket.rooms).find(room => room !== socket.id)
    // // 若有，則先離開
    // if (currentRoom) {
    //   socket.leave(currentRoom)
    // }
    socket.to(roomId).emit('CHAT_ROOM_NOTIFY', {
      roomId,
      message
    }) // 除了自己以外的人接收到訊息
    socket.leave(roomId)
    console.log('current room', Object.keys(socket.rooms))
  })

  socket.on('ROOM_CREATED', ({ roomname, creator, invitedUser }) => {
    invitedUser.forEach(invitedUser => {
      const socketId = onlineUsers.find(({ userId }) => userId === invitedUser)?.socketId
      if (socketId) { // 被邀請的人在線上就通知
        socket.to(socketId).emit('INVITED_TO_ROOM', { message: `${creator} 已將你加入 ${roomname} 聊天室`})
      }
    })
  })
})

module.exports = app;