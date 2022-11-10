const Messages = require('../model/messageModel')

const postMessage = async (req, res, next) => {
  const { message, from , to } = req.body
  const data = await Messages.create({
    message,
    users: [from, to],
    sender: from
  })
  if (data) return res.json({ status: true, message: 'Message added successfully.' })
  return res.json({ status: false, message: 'Failed to add the message.' })
}

const getMessages = async(req, res, next) => {
  const { from, to } = req.query
  const messages = await Messages
    .find()
    .all('users', [from, to])
    .sort({ updatedAt: 1 })
  return res.json({ status: true, messages })
}

module.exports = {
  postMessage,
  getMessages
}