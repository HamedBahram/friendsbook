const yup = require('yup')

const newPostSchema = yup.object({
    content: yup
        .string()
        .required('`content` is required')
        .typeError('`content` must be of type String'),
    img: yup.string().url().typeError('`img` must be a valid URL'),
})

module.exports = newPostSchema
