const express = require('express')
const router = express.Router()

const usersRouter = require('./users')
const authRouter = require('./auth')
const postsRouter = require('./posts')
const apiErrorHandler = require('../errors/apiErrorHandler')

router.use('/auth', authRouter)
router.use('/users', usersRouter)
router.use('/posts', postsRouter)
router.use(apiErrorHandler)

module.exports = router
