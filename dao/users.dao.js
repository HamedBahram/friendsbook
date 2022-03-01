let db
let users
let sessions

const { ObjectId } = require('mongodb')

class UserDao {
    static async getCollectionHandle(client) {
        if (users) return

        try {
            db = await client.db('lama')
            users = await db.collection('users')
            sessions = await db.collection('sessions')
        } catch (error) {
            return { error }
        }
    }

    static async getUserById(id) {
        try {
            return await users.findOne({ _id: ObjectId(id) })
        } catch (error) {
            return { error }
        }
    }

    static async getUserByUsername(username) {
        try {
            return await users.findOne({ username })
        } catch (error) {
            return { error }
        }
    }

    static async getUserByEmail(email) {
        try {
            return await users.findOne({ email })
        } catch (error) {
            return { error }
        }
    }

    static async addUser(user) {
        try {
            return await users.insertOne(user)
        } catch (error) {
            if (error.toString().includes('E11000 duplicate key error')) {
                return {
                    error: new Error('A user with the given username or email already exists.'),
                }
            }
            return { error }
        }
    }

    static async updateUser(id, update) {
        try {
            return await users.updateOne({ _id: ObjectId(id) }, { $set: update })
        } catch (error) {
            return { error }
        }
    }

    static async followUser(userId, myId) {
        try {
            await users.updateOne({ _id: ObjectId(userId) }, { $addToSet: { followers: myId } })
            await users.updateOne({ _id: myId }, { $addToSet: { following: ObjectId(userId) } })
            return { success: true }
        } catch (error) {
            return { error }
        }
    }

    static async unfollowUser(userId, myId) {
        try {
            await users.updateOne({ _id: ObjectId(userId) }, { $pull: { followers: myId } })
            await users.updateOne({ _id: myId }, { $pull: { following: ObjectId(userId) } })
            return { success: true }
        } catch (error) {
            return { error }
        }
    }

    static async deleteUser(id) {
        try {
            await users.deleteOne({ _id: ObjectId(id) })
            await sessions.deleteMany({ user_id: ObjectId(id) })
            // also delete any posts once implemented
            return { success: true }
        } catch (error) {
            return { error }
        }
    }

    static async loginUser(user_id, token) {
        try {
            return await sessions.insertOne({ user_id, token })
        } catch (error) {
            return { error }
        }
    }

    static async logoutUser(id, token) {
        try {
            return await sessions.deleteOne({ user_id: ObjectId(id), token })
        } catch (error) {
            return { error }
        }
    }

    static async logoutOfAllSessions(id) {
        try {
            return await sessions.deleteMany({ user_id: ObjectId(id) })
        } catch (error) {
            return { error }
        }
    }

    static async getUserSession(id, token) {
        try {
            return await sessions.findOne({ user_id: ObjectId(id), token })
        } catch (error) {
            return { error }
        }
    }

    static async deleteSession(token) {
        try {
            return await sessions.deleteOne({ token })
        } catch (error) {
            return { error }
        }
    }
}

module.exports = UserDao
