const {
  setAvatar,
  getUsers
} = require('../controllers/userController')

const router = require('express').Router()

router.get('/', getUsers)
router.post('/setting/:uid', setAvatar)

module.exports = router