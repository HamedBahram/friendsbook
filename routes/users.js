const express = require('express')
const router = express.Router()
const UserController = require('../controllers/users.controller')
const AuthController = require('../controllers/auth.controller')
const validate = require('../middleware/validate')
const userUpdateSchema = require('../validation/userUpdateSchema')

router.get('/:id', UserController.getUser)
router.get('/profile/:username', UserController.getUserByUsername)
router.get('/:id/newsfeed', UserController.getUserNewsfeed)
router.get('/:id/timeline', UserController.getUserTimeline)
router.patch(
    '/:id',
    AuthController.verifySession,
    validate(userUpdateSchema),
    UserController.updateUser
)
router.patch('/:id/follow', AuthController.verifySession, UserController.followUser)
router.patch('/:id/unfollow', AuthController.verifySession, UserController.unfollowUser)
router.delete('/:id', AuthController.verifySession, UserController.deleteUser)

module.exports = router
