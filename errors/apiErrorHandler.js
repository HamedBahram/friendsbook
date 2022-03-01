const APIError = require('./ApiError')

const apiErrorHandler = (err, req, res, next) => {
    if (err instanceof APIError) {
        return res.status(err.code).json({ error: err.message })
    }

    next(err)
}

module.exports = apiErrorHandler
