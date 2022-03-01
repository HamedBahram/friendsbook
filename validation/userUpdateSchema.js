const yup = require('yup')

const userUpdateSchema = yup.object({
    firstName: yup.string(),
    lastName: yup.string(),
    password: yup.string(),
    profilePicture: yup.string().trim(),
    coverPicture: yup.string().trim(),
    admin: yup.boolean(),
})

module.exports = userUpdateSchema
