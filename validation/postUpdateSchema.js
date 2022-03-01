const yup = require('yup')

const postUpdateSchema = yup.object({
    content: yup.string().typeError('`content` must be of type String'),
    img: yup.string().url().typeError('`img` must be a valid URL'),
})

module.exports = postUpdateSchema
