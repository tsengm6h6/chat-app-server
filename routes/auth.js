const {
  register,
  login,
  refresh,
  logout
} = require('../controllers/auth')
const { check } = require('express-validator')
const User = require('../model/User')

const router = require('express').Router()

router.post('/register', [
  check('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be at least 3 chars long')
    .custom(async (value) => {
        const usernameExist = await User.findOne({ name: value })
        if (usernameExist) {
          throw new Error('Username already in use')
        }
        return true
    }),
  check('email')
    .isEmail()
    .withMessage('Invalid email')
    .custom(async (value) => {
      const useremailExist = await User.findOne({ email: value })
      if (useremailExist) {
        throw new Error('E-mail already in use')
      }
      return true
  }),
  check('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 chars long')
    .custom((value, { req }) => {
      if (value !== req.body.confirmPassword) {
        throw new Error('Password confirmation does not match password')
      } 
      return true
    })
], register)

router.post('/login', [
  check('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be at least 3 chars long'),
  check('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 chars long')
], login)

router.post('/refresh', refresh)
router.post('/logout', logout)

module.exports = router