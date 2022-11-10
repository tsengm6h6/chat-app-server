const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 20,
    unique: true
  },
  email: {
    type: String,
    required: true,
    maxLength: 50,
    unique: true
  },
  password: {
    type: String,
    minLength: 8,
    unique: true
  },
  isAvartarImageSet: {
    type: Boolean,
    default: false
  },
  avatarImage: {
    type: String,
    default: ''
  }
})

module.exports = mongoose.model('Users', userSchema)