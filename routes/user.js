const {
  getUserContacts,
  getUserMessages,
  postUserMessage,
  updateMessageReadStatus,
  postRoom
} = require('../controllers/user')
const authenticateToken = require('../middleware/authenticateToken')

const router = require('express').Router()
router.use(authenticateToken)

// READ
router.get('/:userId/contacts', getUserContacts)
router.get('/:userId/messages', getUserMessages)

// CREATE
router.post('/:userId/message', postUserMessage)
router.post('/:userId/room', postRoom)

// UPDATE
router.put('/:userId/messages/status', updateMessageReadStatus)

module.exports = router