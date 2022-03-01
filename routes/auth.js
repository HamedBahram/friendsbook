const express = require('express')
const router = express.Router()
const AuthController = require('../controllers/auth.controller')
const newUserSchema = require('../validation/newUserSchema')
const loginSchema = require('../validation/loginSchema')
const validate = require('../middleware/validate')

router.post('/register', validate(newUserSchema), AuthController.register)
router.post('/login', validate(loginSchema), AuthController.login)
router.delete('/logout', AuthController.verifySession, AuthController.logout)
router.delete('/logout-all', AuthController.verifySession, AuthController.logoutOfAllSessions)

module.exports = router
