const User = require('../model/userModel')
const Room = require('../model/roomModel')
const Message = require('../model/messageModel')

const setAvatar = async (req, res, next) => {
  const { uid } = req.params
  const { image } = req.body
  const user = await User
    .findByIdAndUpdate(uid, { avatarImage: image }, { new: true })
    .lean()
  console.log(user)
  return res.json({ status: true, image: user.avatarImage })
}

const getUsers = async (req, res, next) => {
  const users = await User
    .find({})
    .select(['username', 'email', 'avatarImage'])
  return res.json({ status: true, data: users })
}

// const getUserRooms = async(req, res, next) => {
//   const { user } = req.query
//   console.log('user', user)
//   const rooms = await Room.find()
//     .all('users', [user])
//     .sort({ updatedAt: 1 })
//   return res.json({ status: true, data: rooms })
// }

const getLatestMessage = async(type, from, to) => {
  const filter = type === 'room' ? [to] : [from, to]
  return await Message
    .findOne()
    .all('users', filter)
    .select(['message', 'sender', 'updatedAt'])
    .sort({ createdAt: -1 })
    .lean()
}

// TODO: unread query 
const getUnreadCount = async(type, from, to) => {
  const filter = type === 'room' ? [to] : [from, to]
  return await Message
    .find()
    .all('users', filter)
    .select(['unread'])
    .lean()
  // return await Message
  //   .find( { unread: true } )
  //   .all('user', filter)
  //   .lean()
}

const getUserContacts = async(req, res, next) => {
  const { userId } = req.query
  const users = await User
    .find({})
    .select(['username', 'avatarImage'])
    .sort({ updatedAt: -1 })
    .lean()
  const rooms = await Room
    .find()
    .all('users', [userId])
    .select(['roomname', 'users', 'avatarImage'])
    .sort({ updatedAt: -1 })
    .lean()

  const getContactsWithMessage = async (conactType, contacts) => {
    return Promise.all(
      contacts.map(async(contact) => {
        const latestMessage = await getLatestMessage(conactType, userId, contact._id.toHexString())
        const unreadMsg = await getUnreadCount(conactType, userId, contact._id.toHexString())
        return {
          ...contact,
          latestMessage: latestMessage?.message || '',
          latestMessageSender:  latestMessage?.sender || null,
          latestMessageUpdatedAt:  latestMessage?.updatedAt || null,
          unreadCount: unreadMsg?.filter(msg => msg.unread).length || 0,
          type: conactType
        }
      })
    )
  }

  const userWithoutSelf = users.filter(({ _id }) => userId !== _id.toHexString())
  const userContactsWithMessage = await getContactsWithMessage('user', userWithoutSelf)
  const roomContactsWithMessage = await getContactsWithMessage('room', rooms)
  return res.json({ 
      status: true, 
      data: { users: userContactsWithMessage, rooms: roomContactsWithMessage }
  })
}

module.exports = {
  setAvatar,
  getUsers,
  getUserContacts
}