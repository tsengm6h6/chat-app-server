const User = require('../model/User')
const Room = require('../model/Room')
const Message = require('../model/Message')

// READ
const getUnreadCount = async (type, from, to) => {
  const filter = type === 'room' ? [to] : [from, to]
  const messageReaders = await Message
    .find({ sender: { $ne: from } }) // sender 不是自己的訊息
    .all('users', filter)
    .select(['readers'])
    .sort({ createdAt: -1 })
    .lean()
  
  // readers 裡面沒有自己的 id
  return messageReaders.filter(({ readers }) => readers.indexOf(from) === -1 ).length || 0
}

const getMessageInfo = async(type, from, to) => {
  const filter = type === 'room' ? [to] : [from, to]
  const message = await Message
    .findOne()
    .all('users', filter)
    .select(['message', 'sender', 'updatedAt', 'readers'])
    .sort({ createdAt: -1 })
    .lean()

  const unreadCount = await getUnreadCount(type, from, to)

  return {
    latestMessage: message?.message || null,
    latestMessageSender:  message?.sender || null,
    latestMessageUpdatedAt:  message?.updatedAt || null,
    unreadCount
  }
}

const getUserContacts = async(req, res) => {
  try {
    const { userId } = req.params
    const users = await User
      .find({ _id: { $ne: userId } })
      .select(['name', 'avatarImage', 'chatType'])
      .sort({ updatedAt: -1 })
      .lean()

    const rooms = await Room
      .find()
      .all('users', [userId])
      .select(['name', 'users', 'avatarImage', 'chatType'])
      .sort({ updatedAt: -1 })
      .lean()
      
    const contacts = users.concat(rooms)
    const contactWithMessages = await Promise.all(
      contacts.map(async(contact) => {
        const { _id, chatType: type } = contact
        const messageInfo = await getMessageInfo(type, userId, _id.toHexString())

        return {
          ...contact,
          ...messageInfo
        }
      })
    )

    return res.status(200).json({ 
        status: true, 
        data: contactWithMessages
    })
  } catch(err) {
    return res.status(404).json({ message: err.message })
  }
}

const getUserMessages = async(req, res) => {
  try {
    const { userId } = req.params
    const { type, chatId } = req.query
    const filter = type === 'room' ? [chatId] : [userId, chatId]
    const messages = await Message
      .find()
      .all('users', filter)
      .sort({ createdAt: 1 })
      .lean()
    
    const messagesWithAvatar = await Promise.all(
      messages.map(async(msg) => {
        const senderId = msg.sender
        const user = await User.findById(senderId).lean()
        return {
          ...msg,
          avatarImage: user.avatarImage
        }
      })
    )

    return res.status(200).json({ status: true, data: messagesWithAvatar })
  } catch(err) {
    return res.status(404).json({ message: err.message })
  }
}

// CREATE
const setAvatar = async (req, res) => {
  try {
    const { userId } = req.params
    const { image } = req.body
    const user = await User
      .findByIdAndUpdate(userId, { avatarImage: image }, { new: true })
      .lean()
    return res.json({ status: true, image: user.avatarImage })
  } catch(err) {
    return res.status(404).json({ message: err.message })
  }
}

const postUserMessage = async(req, res) => {
  try {
    const { userId } = req.params
    const { type, chatId } = req.query
    const { message } = req.body

    const newMessage = await Message.create({
      message,
      users: [userId, chatId],
      sender: userId,
      readers: []
    })

    return res.status(200).json({ status: true, data: newMessage })

  } catch(err) {
    return res.status(404).json({ message: err.message })
  }
}

// UPDATE
const updateMessageReadStatus = async (req, res) => {
  try {
    // chatId 的訊息被 userId 已讀
    const { userId } = req.params
    const { type, chatId } = req.query
    const filter = type === 'room' ? [chatId] : [userId, chatId]

    // 撈出所有 chat 中 sender 不是自己的 message
    const messages = await Message
      .find({ sender: { $ne: userId }})
      .all('users', filter)
      .sort({ createdAt: 1 })

    // 取得 message 和 reader 的對應值
    const messageReaderMap = messages.reduce((prev, curr) => {
      return {...prev, [curr._id.toHexString()]: curr.readers }
    }, {})

    // 檢查 userId 是否已存在 readers 裡 -> 不存在則新增
    Object.entries(messageReaderMap).forEach(([key, value]) => {
      const userHasRead = value.indexOf(userId) > -1
      if (!userHasRead) messageReaderMap[key].push(userId) // 還沒已讀就加入
    })
    
    // 更新已讀
    await Promise.all(
      Object.keys(messageReaderMap).map(async (msgId) => {
        return await Message
              .findByIdAndUpdate({ _id: msgId }, { readers: messageReaderMap[msgId] }, { new: true } )
              .lean()
      })
    )
    
    return res.status(200).json({ status: true, data: { message: 'Successfully updated.' } })
  } catch(err) {
    return res.status(404).json({ message: err.message })
  }
}

module.exports = {
  setAvatar,
  getUserContacts,
  getUserMessages,
  postUserMessage,
  updateMessageReadStatus
}