const yup = require('yup')

const commentSchema = yup.object({
    comment: yup.string().required().typeError('`content` must be of type String'),
})

module.exports = commentSchema
