class ExpressError extends Error {
    constructor(statusCode, message) {
        super(message); // this sets the message property
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;

