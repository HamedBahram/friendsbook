const PostDao = require('../dao/posts.dao')

class PostController {
    static async getPost(req, res, next) {
        try {
            const { id } = req.params
            const post = await PostDao.getPost(id)
            if (!post) throw new Error()

            res.json({ post })
        } catch (error) {
            next(error)
        }
    }

    static async getAllPosts(req, res, next) {
        try {
            const posts = await PostDao.getAllPosts()
            res.json({ posts })
        } catch (error) {
            next(error)
        }
    }

    static async addPost(req, res, next) {
        try {
            const { user } = req
            const { content, img = '' } = req.body

            const newPost = {
                user_id: user._id,
                content,
                img,
                likes: [],
                comments: [],
                created_at: new Date(),
                updated_at: new Date(),
            }

            const { insertedId, error } = await PostDao.addPost(newPost)
            if (error) throw new Error(error)

            const post = await PostDao.getPost(insertedId)
            if (!post) throw new Error()

            res.json({
                post: {
                    ...post,
                    user: {
                        _id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        username: user.username,
                        profilePicture: user.profilePicture,
                    },
                },
            })
        } catch (error) {
            next(error)
        }
    }

    static async updatePost(req, res, next) {
        try {
            const { id: postId } = req.params
            const { content, img } = req.body

            const update = { updated_at: new Date() }

            if (content) update.content = content
            if (img) update.img = img

            const { error } = await PostDao.updatePost(postId, update)
            if (error) throw new Error(error)

            const updatedPost = await PostDao.getPost(postId)
            if (!updatedPost) throw new Error()

            res.json({ post: updatedPost })
        } catch (error) {
            next(error)
        }
    }

    static async likePost(req, res, next) {
        try {
            const { id } = req.params
            const { _id: myId } = req.user

            const post = await PostDao.getPost(id)
            if (!post) {
                return res.status(404).json({ error: 'Post not found' })
            }

            if (String(post.user_id) === String(myId)) {
                return res.status(403).json({ error: 'You cannot like your own post' })
            }

            const { error } = await PostDao.likePost(id, myId)
            if (error) throw new Error(error)

            const updatedPost = await PostDao.getPost(id)
            if (!updatedPost) throw new Error()

            res.json({ post: updatedPost })
        } catch (error) {
            next(error)
        }
    }

    static async unlikePost(req, res, next) {
        try {
            const { id } = req.params
            const { _id: myId } = req.user

            const post = await PostDao.getPost(id)
            if (!post) {
                return res.status(404).json({ error: 'Post not found' })
            }

            if (String(post.user_id) === String(myId)) {
                return res.status(403).json({ error: 'You cannot unlike your own post' })
            }

            const { error } = await PostDao.unlikePost(id, myId)
            if (error) throw new Error(error)

            const updatedPost = await PostDao.getPost(id)
            if (!updatedPost) throw new Error()

            res.json({ post: updatedPost })
        } catch (error) {
            next(error)
        }
    }

    static async addComment(req, res, next) {
        try {
            const { id } = req.params
            const { comment } = req.body
            const { _id: userId } = req.user

            const post = await PostDao.getPost(id)
            if (!post) {
                return res.status(404).json({ error: 'Post not found' })
            }

            if (String(post.user._id) === String(userId)) {
                return res.status(403).json({ error: 'Yoiu cannot comment on your own post' })
            }

            const { error } = await PostDao.addComment(id, { user_id: userId, text: comment })
            if (error) throw new Error(error)

            const updatedPost = await PostDao.getPost(id)
            if (!updatedPost) throw new Error()

            res.json({ post: updatedPost })
        } catch (error) {
            next(error)
        }
    }

    static async deletePost(req, res, next) {
        try {
            const { id: postId } = req.params
            const { error } = await PostDao.deletePost(postId)
            if (error) throw new Error(error)

            res.status(204).json({ success: true })
        } catch (error) {
            next(error)
        }
    }

    static async isPostOwner(req, res, next) {
        try {
            const { id: postId } = req.params
            const { _id: userId } = req.user

            const post = await PostDao.getPost(postId)
            if (!post) {
                return res.status(404).json({ error: 'Post not found.' })
            }

            if (String(post.user_id) !== String(userId)) {
                return res
                    .status(403)
                    .json({ error: 'You are not authorized to update or delete this post.' })
            }

            req.post = post
            next()
        } catch (error) {
            next(error)
        }
    }
}

module.exports = PostController
