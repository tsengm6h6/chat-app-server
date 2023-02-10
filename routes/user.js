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
const authenticateToken = require('../middleware/authenticateToken')

const router = require('express').Router()

// READ
router.get('/:userId/contacts', authenticateToken, getUserContacts)
router.get('/:userId/messages', authenticateToken, getUserMessages)
router.get('/:userId/rooms', authenticateToken, getUserRooms)

// CREATE
router.post('/:userId/setting', authenticateToken, setAvatar)
router.post('/:userId/message', authenticateToken, postUserMessage)
router.post('/:userId/room', authenticateToken, postRoom)

// UPDATE
router.put('/:userId/messages/status', authenticateToken, updateMessageReadStatus)

module.exports = router