const User = require('../model/User')
const bcrypt = require('bcryptjs')

const register = async (req, res, next) => {
  const { username, email, password, avatarImage } = req.body

  const usernameExist = await User.findOne({ name: username })
  const useremailExist = await User.findOne({ email })

  if (usernameExist) {
    return res.status(400).json({ status: false, message: 'Username is already exist.'})
  } 
  if (useremailExist) {
    return res.status(400).json({ status: false, message: 'Email is already exist.' })
  }
  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await User.create({
    name: username,
    email,
    password: hashedPassword,
    avatarImage,
    chatType: 'user'
  })
  delete user._doc.password
  return res.json({ status: true, data: user })
}

const login = async (req, res, next) => {
  const { username, password } = req.body
  console.log( username, password)
  const user = await User.findOne({ name: username })
  if (!user) {
    return res.status(400).json({ status: false, message: 'User does not exists'})
  }
  const passwordCorrect = bcrypt.compareSync(password, user.password)
  if (!passwordCorrect) {
    return res.status(400).json({ status: false, message: 'Password is not correct.'})
  }
  delete user._doc.password
  return res.json({ status: true, data: user })
}

module.exports = {
  register,
  login
}