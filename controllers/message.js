const Messages = require('../model/Message')

const postMessage = async (req, res, next) => {
  const { type, from , to } = req.query
  const { message } = req.body
  const data = await Messages.create({
    message,
    users: [from, to],
    sender: from
  })
  const filter = type === 'room' ? [to] : [from, to]
  if (data) {
    const messages = await Messages
      .find()
      .all('users', filter)
      .sort({ createdAt: 1 })
    return res.json({ status: true, messages })
  }
  return res.json({ status: false, message: 'Failed to add the message.' })
}

const getMessages = async(req, res, next) => {
  const { type, from, to } = req.query
  const filter = type === 'room' ? [to] : [from, to]
  const messages = await Messages
    .find()
    .all('users', filter)
    .sort({ createdAt: 1 })
  return res.json({ status: true, messages })
}

const updateReadStatus = async(req, res, next) => {
  try {
    const { receiverId } = req.body
    console.log('=== receiver ===', receiverId)
    if (!receiverId) {
      return res.status(400).json({ status: false, message: 'receiverId is required.' })
    }
    // 修改已讀
    const response = await Messages
      .find( { sender: { $ne: receiverId } } )
      .updateMany({ unread: false })
  
    if (response) {
      return res.status(200).json({ status: true, messages: 'Successfully updated.' })
    }
    throw new Error()
  } catch(e) {
    console.log('### update error ###', e)
    return res.status(500).json({ status: false, message: e.message })
  }
}

module.exports = {
  postMessage,
  getMessages,
  updateReadStatus
}