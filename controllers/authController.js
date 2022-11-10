const User = require('../model/userModel')
const bcrypt = require('bcryptjs')

const registerUser = async (req, res, next) => {
  const { username, email, password } = req.body

  const usernameExist = await User.findOne({ username })
  const useremailExist = await User.findOne({ email })

  if (usernameExist) {
    return res.json({ status: false, msg: 'Username is already exist.'})
  } 
  if (useremailExist) {
    return res.json({ status: false, msg: 'Email is already exist.' })
  }
  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await User.create({
    username,
    email,
    password: hashedPassword
  })
  delete user._doc.password
  return res.json({ status: true, user })
}

const loginUser = async (req, res, next) => {
  const { username, password } = req.body
  const user = await User.findOne({ username })
  if (!user) {
    return res.json({ status: false, msg: 'User does not exists' })
  }
  const passwordCorrect = bcrypt.compare(password, user.password)
  if (!passwordCorrect) {
    return res.json({ status: false, msg: 'Password is not correct.' })
  }
  delete user._doc.password
  return res.json({ status: true, user })
}

module.exports = {
  registerUser,
  loginUser
}