const Messages = require('../model/messageModel')

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
      .sort({ updatedAt: 1 })
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
    .sort({ updatedAt: 1 })
  return res.json({ status: true, messages })
}

module.exports = {
  postMessage,
  getMessages
}