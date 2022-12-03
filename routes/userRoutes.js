const {
  setAvatar,
  getUsers,
  getUserContacts
} = require('../controllers/userController')

const router = require('express').Router()

router.get('/', getUsers)
router.get('/contacts', getUserContacts)
router.post('/setting/:uid', setAvatar)

module.exports = router