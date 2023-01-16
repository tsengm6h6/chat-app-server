const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
    name: {
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
    },
    avatarImage: {
      type: String,
      default: ''
    },
    chatType: {
      type: String,
      default: 'user'
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('User', userSchema)