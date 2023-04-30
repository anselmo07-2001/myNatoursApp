class AppError extends Error {
    constructor(message, statusCode) {
        // yung super is the Error(message) nakaset na dito yung property na gagamitin
        super(message)
        this.statusCode = statusCode
        this.status = `${this.statusCode}`.startsWith("4") ? "fail" : "error"

        //capturing the stack traces but not the class and the instance
        // the argument pass, this will not be added to the error stack traces 
        // the this.contructor is the class
        // kapag ginamit ito sa paggawa ng object and yung contructor function ay ininvoke
        // hindi sila kasali sa stack trace
        Error.captureStackTrace(this, this.contructor)
    }
}

module.exports = AppError