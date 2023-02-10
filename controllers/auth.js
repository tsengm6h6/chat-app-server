const User = require('../model/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')

const register = async (req, res, next) => {
  const { username, email, password, avatarImage } = req.body

  const errors = validationResult(req)
  if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await User.create({
    name: username,
    email,
    password: hashedPassword,
    avatarImage,
    chatType: 'user'
  })
  delete user._doc.password
  const accessToken = jwt.sign({ user: { name: username } }, process.env.ACCESS_TOKEN_SECRET)
  return res.json({ status: true, data: { ...user._doc, accessToken } })
}

const login = async (req, res, next) => {
  const { username, password } = req.body

  const errors = validationResult(req)
  if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  
  const user = await User.findOne({ name: username })
  if (!user) {
    return res.status(400).json({ errors: [{ 'msg': 'User does not exists' }] })
  }
  const passwordCorrect = bcrypt.compareSync(password, user.password)
  if (!passwordCorrect) {
    return res.status(400).json({ errors: [{ 'msg': 'Password is not correct.' }] })
  }
  delete user._doc.password
  const accessToken = jwt.sign({ user: { name: username } }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' })
  return res.json({ status: true, data: { ...user._doc, accessToken } })
}

module.exports = {
  register,
  login
}