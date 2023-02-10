const {
  getUserContacts,
  getUserMessages,
  postUserMessage,
  updateMessageReadStatus,
  postRoom
} = require('../controllers/user')
const authenticateToken = require('../middleware/authenticateToken')

const router = require('express').Router()

// READ
router.get('/:userId/contacts', authenticateToken, getUserContacts)
router.get('/:userId/messages', authenticateToken, getUserMessages)

// CREATE
router.post('/:userId/message', authenticateToken, postUserMessage)
router.post('/:userId/room', authenticateToken, postRoom)

// UPDATE
router.put('/:userId/messages/status', authenticateToken, updateMessageReadStatus)

module.exports = router