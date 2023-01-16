const {
  getMessages,
  postMessage,
  updateReadStatus
} = require('../controllers/message')

const router = require('express').Router()

router.get('/messages', getMessages)
router.post('/', postMessage)
router.post('/update', updateReadStatus)

module.exports = router