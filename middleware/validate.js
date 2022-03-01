const APIError = require('../errors/ApiError')

const validate = schema => async (req, res, next) => {
    try {
        req.body = await schema
            .noUnknown(true, 'Request contains invalid fields.')
            .test({
                name: 'notEmpty',
                message: 'Request does not contain any field.',
                test: value => Object.values(value).length !== 0,
            })
            .validate(req.body, { strict: true })
        next()
    } catch (error) {
        // This produces the same result as below
        // res.status(400).json({ error: error.message })

        // Using apiErrorHandler to handle errors
        next(new APIError(400, error.message)) // { code: 400, message: error.message }
    }
}

module.exports = validate
