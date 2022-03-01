const { ObjectId } = require('mongodb')

const postSchema = {
    user_id: ObjectId,
    user: {
        _id: {
            type: ObjectId,
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
        profilePicture: {
            type: String,
        },
    },
    content: {
        type: String,
        required: true,
    },
    img: {
        type: String,
    },
    likes: {
        type: [ObjectId],
        default: [],
    },
    comments: [
        {
            user_id: {
                type: ObjectId,
                required: true,
            },
            text: {
                type: String,
                required: true,
            },
        },
    ],
    created_at: {
        type: Date,
        default: Date.now(),
    },
    updated_at: {
        type: Date,
        default: Date.now(),
    },
}
