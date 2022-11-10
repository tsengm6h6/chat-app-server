const {
  getMessages,
  postMessage
} = require('../controllers/messageController')

const router = require('express').Router()

router.get('/messages', getMessages)
router.post('/', postMessage)

module.exports = router