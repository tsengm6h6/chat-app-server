const Message = require('../model/Message')

const initSocket = (server, corsOptions) => {
  const io = require('socket.io')(server, { cors: corsOptions })

  let onlineUsers = []

  io.on('connection', socket => {
    socket.on('USER_ONLINE', (userId, socketId) => {
      const userExisted = onlineUsers.some(user => user.userId === userId)
      const prevSocketId = userExisted?.socketId || null
      if (userExisted && prevSocketId !== socketId) {
        onlineUsers = onlineUsers.map(user => {
          return user.userId === userId ? ({ ...user, socketId: socketId }) : user
        })
      } else if (!userExisted) {
        onlineUsers.push({
          userId, 
          socketId: socketId
        })
        io.emit('ONLINE_USER_CHANGED', onlineUsers)
      }
      console.log('***online users****', onlineUsers)
    })

    socket.on('USER_OFFLINE', (logoutUserId) => {
      console.log('logout', logoutUserId)
      onlineUsers = onlineUsers.filter(({ userId }) => userId !== logoutUserId)
      io.emit('ONLINE_USER_CHANGED', onlineUsers)
    })

    socket.on('disconnect', () => {
      console.log('server user disconnected')
    })

    socket.on('SEND_MESSAGE', async (messageData) => {
      const { type, sender, receiver } = messageData
        
      const filter = type === 'room' ? [receiver] : [sender, receiver]
      const messageReader = await Message
        .find()
        .all('users', filter)
        .select(['readers'])
        .sort({ createdAt: -1 })
        .lean()
      
      const unreadCount = messageReader.filter(({ readers }) => readers.length === 0).length
      const clientId = type === 'user' ? onlineUsers.find(({ userId }) => userId === receiver)?.socketId : receiver
      if (clientId) {
        socket.to(clientId).emit('RECEIVE_MESSAGE', {...messageData, unreadCount});
      }
    })

    socket.on('UPDATE_MESSAGE_STATUS', ({ type, readerId, messageSender }) => {
      // messageSender 的訊息被 readerId 已讀
      console.log('=== 更新已讀 ===')
      const socketId = type === 'room' 
        ? messageSender 
        : onlineUsers.find(({ userId }) => userId === messageSender)?.socketId
      if (socketId) {
        socket.to(socketId).emit('MESSAGE_READ', { type, readerId, messageSender })
      }
    })

    socket.on('UPDATE_MESSAGE_READERS', ({ type, readerId, toId }) => {
      console.table({ type, readerId, toId })
      console.table(onlineUsers)
      const socketId = type === 'room' 
        ? toId 
        : onlineUsers.find(({ userId }) => userId === toId)?.socketId
      if (socketId) {
        console.log('socktId', socketId)
        socket.to(socketId).emit('MESSAGE_READ', { type, readerId, toId })
      }
    })

    socket.on('USER_TYPING', ({ chatType, senderId, receiverId, typing, message }) => {
      if (chatType === 'room') {
        socket.to(receiverId).emit('TYPING_NOTIFY', { chatType, senderId, receiverId, typing, message })
      } else {
        const receiver = onlineUsers.find(({ userId }) => userId === receiverId)
        if (receiver) {
          socket.to(receiver.socketId).emit('TYPING_NOTIFY', { chatType, senderId, receiverId, typing, message })
        }
      }
    })

    socket.on('ENTER_CHAT_ROOM', roomData => {
      const { roomId, message } = roomData
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
      socket.to(roomId).emit('CHAT_ROOM_NOTIFY', {
        roomId,
        message
      }) // 除了自己以外的人接收到訊息
      socket.leave(roomId)
    })
    
    socket.on('ROOM_CREATED', ({ name, creator, invitedUser }) => {
      invitedUser.forEach(invitedUser => {
        const socketId = onlineUsers.find(({ userId }) => userId === invitedUser)?.socketId
        if (socketId) { // 被邀請的人在線上就通知
          socket.to(socketId).emit('INVITED_TO_ROOM', { message: `${creator} 已將你加入 ${name} 聊天室`})
        }
      })
    })
  })
}

module.exports = {
  initSocket
}