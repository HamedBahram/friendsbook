const yup = require('yup')

const loginSchema = yup.object({
    password: yup.string().min(5).max(14).required(),
    email: yup.string().trim().email().required(),
})

module.exports = loginSchema
