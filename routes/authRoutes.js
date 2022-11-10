const {
  registerUser,
  loginUser
} = require('../controllers/authController')

const router = require('express').Router()

router.post('/register', registerUser)
router.post('/login', loginUser)

module.exports = router