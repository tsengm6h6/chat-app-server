const Room = require('../model/Room')

const getUserRooms = async(req, res, next) => {
  const { user } = req.query
  console.log('user', user)
  const rooms = await Room.find()
    .all('users', [user])
    .sort({ updatedAt: -1 })
  return res.json({ status: true, data: rooms })
}

const postRoom = async (req, res, next) => {
  const { name, users,  avatarImage } = req.body
  try {
    const data = await Room.create({
      name,
      users,
      avatarImage,
      chatType: 'room'
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