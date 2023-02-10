const {
  register,
  login
} = require('../controllers/auth')
const { check } = require('express-validator')
const User = require('../model/User')

const router = require('express').Router()

router.post('/register', [
  check('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('must be at least 3 chars long')
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
    .withMessage('Must be at least 8 chars long')
    .custom((value, { req }) => {
      if (value !== req.body.confirmPassword) {
        throw new Error('Password confirmation does not match password')
      } 
      return true
    })
], register)
router.post('/login', [
  check('username')
    .isLength({ min: 3, max: 20 }),
  check('password')
    .isLength({ min: 8 })
    .withMessage('Must be at least 8 chars long')
], login)

module.exports = router