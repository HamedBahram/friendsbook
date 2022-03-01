class APIError extends Error {
    constructor(code, message) {
        super()
        this.code = code
        this.message = message
    }

    static badRequest(msg) {
        return new APIError(400, msg)
    }
}

module.exports = APIError
