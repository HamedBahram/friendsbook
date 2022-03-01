const bcrypt = require('bcryptjs')
const PostDao = require('../dao/posts.dao')
const UserDao = require('../dao/users.dao')

const hashPassword = async password => await bcrypt.hash(password, 12)
const userToJson = user => ({ ...user, password: undefined })

class UserController {
    static async getUser(req, res, next) {
        try {
            const { id } = req.params
            const userFromDB = await UserDao.getUserById(id)
            if (!userFromDB) {
                return res.status(404).json({ error: 'User not found' })
            }

            res.json({ user: userToJson(userFromDB) })
        } catch (error) {
            next(error)
        }
    }

    static async getUserByUsername(req, res, next) {
        try {
            const { username } = req.params
            const userFromDB = await UserDao.getUserByUsername(username)
            if (!userFromDB) {
                return res.status(404).json({ error: 'User not found' })
            }

            res.json({ user: userToJson(userFromDB) })
        } catch (error) {
            next(error)
        }
    }

    static async getUserNewsfeed(req, res, next) {
        try {
            const { id } = req.params
            const user = await UserDao.getUserById(id)
            const userPosts = await PostDao.getUserTimeline(id)
            const friendsPosts = await Promise.all(
                user.following.map(friend_id => PostDao.getUserTimeline(friend_id))
            )

            res.json({
                posts: [...userPosts, ...friendsPosts.reduce((acc, curr) => acc.concat(curr), [])],
            })
        } catch (error) {
            next(error)
        }
    }

    static async getUserTimeline(req, res, next) {
        try {
            const { id } = req.params
            const posts = await PostDao.getUserTimeline(id)
            res.json({ posts })
        } catch (error) {
            next(error)
        }
    }

    static async updateUser(req, res, next) {
        try {
            const { id } = req.params
            const { _id: myId, admin: isAdmin } = req.user
            if (id !== String(myId) && !isAdmin) {
                return res.status(401).json({ error: 'You can only update your own account.' })
            }

            const { firstName, lastName, password, profilePicture, coverPicture, admin } = req.body
            const update = { updated_at: new Date() }

            if (admin && !isAdmin) {
                return res.status(403).json({ error: 'You cannot change your admin status.' })
            }

            if (password) {
                update.password = await hashPassword(password)
            }

            if (firstName) update.firstName = firstName
            if (lastName) update.lastName = lastName
            if (profilePicture) update.profilePicture = profilePicture
            if (coverPicture) update.coverPicture = coverPicture
            if (admin) update.admin = admin

            const { error } = await UserDao.updateUser(id, update)
            if (error) throw new Error(error)

            const updatedUser = await UserDao.getUserById(id)
            if (!updatedUser) throw new Error()

            res.json({
                user: userToJson(updatedUser),
            })
        } catch (error) {
            next(error)
        }
    }

    static async followUser(req, res, next) {
        try {
            const { id: userId } = req.params
            const { _id: myId } = req.user
            if (userId === String(myId)) {
                return res.status(403).json({ error: 'You cannot follow yourself' })
            }

            const { error } = await UserDao.followUser(userId, myId)
            if (error) throw new Error(error)

            const updatedUser = await UserDao.getUserById(myId)
            if (!updatedUser) throw new Error()

            res.json({
                user: userToJson(updatedUser),
            })
        } catch (error) {
            next(error)
        }
    }

    static async unfollowUser(req, res, next) {
        try {
            const { id: userId } = req.params
            const { _id: myId } = req.user
            if (userId === String(myId)) {
                return res.status(403).json({ error: 'You cannot unfollow yourself.' })
            }

            const { error } = await UserDao.unfollowUser(userId, myId)
            if (error) throw new Error(error)

            const updatedUser = await UserDao.getUserById(myId)
            if (!updatedUser) throw new Error()

            res.json({
                user: userToJson(updatedUser),
            })
        } catch (error) {
            next(error)
        }
    }

    static async deleteUser(req, res, next) {
        try {
            const { id } = req.params
            const { _id: myId, admin: isAdmin } = req.user

            if (id !== String(myId) && !isAdmin) {
                return res.status(401).json({ error: 'You can only delete your own account.' })
            }

            const { error } = await UserDao.deleteUser(id)
            if (error) throw new Error(error)

            res.status(204).json({ success: true })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = UserController
