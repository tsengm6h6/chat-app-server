const User = require('../model/userModel')
const bcrypt = require('bcryptjs')

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

module.exports = {
  setAvatar,
  getUsers
}