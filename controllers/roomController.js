const Room = require('../model/roomModel')

const getUserRooms = async(req, res, next) => {
  const { user } = req.query
  console.log('user', user)
  const rooms = await Room.find()
    .all('users', [user])
    .sort({ updatedAt: 1 })
  return res.json({ status: true, data: rooms })
}

const postRoom = async (req, res, next) => {
  const { roomname, users,  avatarImage } = req.body
  const data = await Room.create({
    roomname,
    users,
    avatarImage
  })
  if (data) {
    console.log(data)
    return res.json({ status: true, messages: 'Successfully created a room.'  })
  }
  return res.json({ status: false, message: 'Failed to create the room' })
}

module.exports = {
  postRoom,
  getUserRooms
}