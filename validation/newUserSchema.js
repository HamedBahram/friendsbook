const yup = require('yup')

const newUserSchema = yup.object({
    password: yup.string().min(5).max(14).required(),
    email: yup.string().trim().email().required(),
    username: yup.string().trim().required(),
})

module.exports = newUserSchema
