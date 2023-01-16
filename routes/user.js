const { 
  getUserRooms, 
  postRoom 
} = require('../controllers/roomController')

const {
  setAvatar,
  getUserContacts,
  getUserMessages,
  postUserMessage,
  updateMessageReadStatus
} = require('../controllers/user')

const router = require('express').Router()

// READ
router.get('/:userId/contacts', getUserContacts)
router.get('/:userId/messages', getUserMessages)
router.get('/:userId/rooms', getUserRooms)

// CREATE
router.post('/:userId/setting', setAvatar)
router.post('/:userId/message', postUserMessage)
router.post('/:userId/room', postRoom)

// UPDATE
router.put('/:userId/messages/status', updateMessageReadStatus)

module.exports = router