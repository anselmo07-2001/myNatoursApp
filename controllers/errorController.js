const AppError = require("../utils/appError")

const handleCastErrorDB = err => {
     const message = `Invalid ${err.path}: ${err.value}`
     return new AppError(message, 400)
}



const sendErrDevelopment = (err,res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack
    })
}

const sendErrProduction = (err,res) => {
    if (err.isOperationError) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        })
    }
    else {
        console.error("ERRORRR", err)
        res.status(500).json({
            status: err.status,
            message: `Something went wrong ${err.statusCode}`
        })
    }
}





module.exports = (err,req,res,next) => {
    console.log("Hit! Global error handler MW",err.stack)
    // dito meron mga error na hindi naka specify yung ano yung status code and status
    // kaya naglalagay dito ng default value
    // sometimes yung mga error na papasok sa handler na ito hindi naka specify yung 
    // statusCode and status nila, dahil yung ibang error is naggagaling sa mongoose,
    // dapat yung mga error na walang statusCode/status binibigyan
    err.statusCode = err.statusCode || 500
    err.status = err.status || "error"

    //Magkaiba ang error msg sa dev at prod, mas detail and dev, yung prod hindi
    // kapag nasa prod then programming error, hindi dapat naleleak yung error log sa user
    if (process.env.NODE_ENV === "development") {
        sendErrDevelopment(err,res)
    }

    if (process.env.NODE_ENV === "production") {
        let error = {...err}
        
        
        if (err.name === "CastError") error = handleCastErrorDB(err)
        
        sendErrProduction(error,res)
    }
}