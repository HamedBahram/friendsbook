const { ObjectId } = require('mongodb')

let db
let posts

class PostDao {
    static async getCollectionHandle(client) {
        if (posts) return

        try {
            db = await client.db('lama')
            posts = await db.collection('posts')
        } catch (error) {
            return { error }
        }
    }

    static async getPost(id) {
        try {
            return await posts.findOne({ _id: ObjectId(id) })
        } catch (error) {
            return { error }
        }
    }

    static async getUserTimeline(id) {
        try {
            const pipeline = [
                {
                    $match: {
                        user_id: ObjectId(id),
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        let: {
                            id: '$user_id',
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$_id', '$$id'],
                                    },
                                },
                            },
                            {
                                $project: {
                                    firstName: 1,
                                    lastName: 1,
                                    username: 1,
                                    profilePicture: 1,
                                },
                            },
                        ],
                        as: 'user',
                    },
                },
                {
                    $unwind: {
                        path: '$user',
                    },
                },
                {
                    $sort: {
                        updated_at: -1,
                    },
                },
            ]

            return await posts.aggregate(pipeline).toArray()
        } catch (error) {
            return { error }
        }
    }

    static async getAllPosts() {
        try {
            return await posts.find({}).toArray()
        } catch (error) {
            return { error }
        }
    }

    static async addPost(post) {
        try {
            return await posts.insertOne(post)
        } catch (error) {
            return { error }
        }
    }

    static async updatePost(id, update) {
        try {
            return await posts.updateOne({ _id: ObjectId(id) }, { $set: update })
        } catch (error) {
            return { error }
        }
    }

    static async likePost(id, user_id) {
        try {
            return await posts.updateOne({ _id: ObjectId(id) }, { $addToSet: { likes: user_id } })
        } catch (error) {
            return { error }
        }
    }

    static async unlikePost(id, user_id) {
        try {
            return await posts.updateOne({ _id: ObjectId(id) }, { $pull: { likes: user_id } })
        } catch (error) {
            return { error }
        }
    }

    static async addComment(id, comment) {
        try {
            return await posts.updateOne({ _id: ObjectId(id) }, { $push: { comments: comment } })
        } catch (error) {
            return { error }
        }
    }

    static async deletePost(id) {
        try {
            return await posts.deleteOne({ _id: ObjectId(id) })
        } catch (error) {
            return { error }
        }
    }
}

module.exports = PostDao
