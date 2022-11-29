const mongoose = require('mongoose')
const { Schema } = mongoose

const roomSchema = new Schema(
  {
    roomname: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 20,
      unique: true
    },
    users: {
      type: Array,
      required: true
    },
    avatarImage: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Rooms', roomSchema)