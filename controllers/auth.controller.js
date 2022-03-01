const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const UserDao = require('../dao/users.dao')

const hashPassword = async password => await bcrypt.hash(password, 12)
const comparePassword = async (password, user) => await bcrypt.compare(password, user.password)
const encodeUser = user_id => {
    return jwt.sign(
        { exp: Math.floor(Date.now() / 1000) + 60 * 60 * 4, user_id },
        process.env.AUTH_TOKEN_SECRET
    )
}
const decode = token => {
    return jwt.verify(token, process.env.AUTH_TOKEN_SECRET, (error, user_id) => {
        if (error) return { error }
        return user_id
    })
}
const userToJson = user => ({ ...user, password: undefined })

class AuthController {
    static async register(req, res, next) {
        try {
            const { username, email, password } = req.body

            const user = {
                firstName: '',
                lastName: '',
                username: username.toLowerCase(),
                email,
                password: await hashPassword(password),
                profilePicture: '',
                coverPicture: '',
                followers: [],
                following: [],
                admin: false,
                created_at: new Date(),
                updated_at: new Date(),
            }

            const { insertedId, error } = await UserDao.addUser(user)
            if (error) return res.status(400).json({ error: error.message })

            const userFromDB = await UserDao.getUserById(insertedId)
            if (!userFromDB) throw new Error('Server encountered an error. Please try again.')

            const token = encodeUser(userFromDB._id)
            const result = await UserDao.loginUser(userFromDB._id, token)
            if (result.error) throw new Error(result.error)

            res.json({
                auth_token: token,
                user: userToJson(userFromDB),
            })
        } catch (error) {
            next(error)
        }
    }

    static async login(req, res, next) {
        try {
            const { email, password } = req.body

            const userFromDB = await UserDao.getUserByEmail(email)
            if (!userFromDB) {
                return res.status(401).json({ error: 'Check your email & password' })
            }

            const authenticated = await comparePassword(password, userFromDB)
            if (!authenticated) {
                return res.status(401).json({ error: 'Check your email & password' })
            }

            const token = encodeUser(userFromDB._id)
            const { error } = await UserDao.loginUser(userFromDB._id, token)
            if (error) throw new Error(error)

            res.json({
                auth_token: token,
                user: userToJson(userFromDB),
            })
        } catch (error) {
            next(error)
        }
    }

    static async logout(req, res, next) {
        try {
            const token = req.auth_token
            const { _id: user_id } = req.user

            const { error } = await UserDao.logoutUser(user_id, token)
            if (error) throw new Error(error)

            res.status(204).json({ success: true })
        } catch (error) {
            next(error)
        }
    }

    static async logoutOfAllSessions(req, res, next) {
        try {
            const { _id: user_id } = req.user

            const { error } = await UserDao.logoutOfAllSessions(user_id)
            if (error) throw new Error(error)

            res.status(204).json({ success: true })
        } catch (error) {
            next(error)
        }
    }

    static async verifySession(req, res, next) {
        try {
            const auth_header = req.get('Authorization')
            if (!auth_header) {
                return res.status(401).json({ error: 'Auth token not found!' })
            }

            const token = auth_header.slice('Bearer '.length)
            const { user_id, error } = decode(token)
            if (error) {
                await UserDao.deleteSession(token)
                return res.status(401).json({ error: error.message })
            }

            const session = await UserDao.getUserSession(user_id, token)
            if (!session) {
                return res.status(401).json({ error: 'You are not logged in.' })
            }

            const userFromDB = await UserDao.getUserById(user_id)
            if (!userFromDB) {
                return res.status(401).json({ error: 'User not found!' })
            }

            req.user = userToJson(userFromDB)
            req.auth_token = token
            next()
        } catch (error) {
            next(error)
        }
    }
}

module.exports = AuthController
