const express = require('express')
const router = express.Router()
const AuthController = require('../controllers/auth.controller')
const PostController = require('../controllers/posts.controller')
const validate = require('../middleware/validate')
const commentSchema = require('../validation/commentSchema')
const newPostSchema = require('../validation/newPostSchema')
const postUpdateSchema = require('../validation/postUpdateSchema')

router.get('/', PostController.getAllPosts)
router.post('/', AuthController.verifySession, validate(newPostSchema), PostController.addPost)
router.get('/:id', PostController.getPost)
router.patch(
    '/:id',
    AuthController.verifySession,
    PostController.isPostOwner,
    validate(postUpdateSchema),
    PostController.updatePost
)
router.patch('/:id/like', AuthController.verifySession, PostController.likePost)
router.patch('/:id/unlike', AuthController.verifySession, PostController.unlikePost)
router.patch(
    '/:id/comment',
    AuthController.verifySession,
    validate(commentSchema),
    PostController.addComment
)
router.delete(
    '/:id',
    AuthController.verifySession,
    PostController.isPostOwner,
    PostController.deletePost
)

module.exports = router
