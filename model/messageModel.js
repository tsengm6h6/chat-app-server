const mongoose = require('mongoose')
const { Schema } = mongoose

const messageSchema = new Schema(
  {
    message: {
      type: String,
      required: true
    },
    users: {
      type: Array,
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    // receiverHasRead: {
    //   type: Boolean,
    //   default: false
    // },
    unread: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Messages', messageSchema)