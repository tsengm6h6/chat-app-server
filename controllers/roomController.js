const Room = require('../model/roomModel')

const getUserRooms = async(req, res, next) => {
  const { user } = req.query
  console.log('user', user)
  const rooms = await Room.find()
    .all('users', [user])
    .sort({ updatedAt: -1 })
  return res.json({ status: true, data: rooms })
}

const postRoom = async (req, res, next) => {
  const { roomname, users,  avatarImage } = req.body
  try {
    const data = await Room.create({
      roomname,
      users,
      avatarImage
    })
    if (data) {
      console.log(data)
      return res.json({ status: true, messages: 'Successfully created a room.'  })
    }
    throw new Error()
  } catch(e) {
    console.log('ERROR', e.message)
    return res.status(500).json({ status: false, message: e.message })
  }
}

module.exports = {
  postRoom,
  getUserRooms
}