const {
  getUserRooms,
  postRoom
} = require('../controllers/roomController')

const router = require('express').Router()

router.get('/rooms', getUserRooms)
router.post('/', postRoom)

module.exports = router