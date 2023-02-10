const {
  getMessages,
  postMessage,
  updateReadStatus
} = require('../controllers/message')
const authenticateToken = require('../middleware/authenticateToken')

const router = require('express').Router()

router.get('/messages', authenticateToken, getMessages)
router.post('/', authenticateToken, postMessage)
router.post('/update', authenticateToken, updateReadStatus)

module.exports = router