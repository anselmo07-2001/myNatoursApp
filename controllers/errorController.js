const AppError = require("../utils/appError")

const handleCastErrorDB = err => {
     const message = `Invalid ${err.path}: ${err.value}`
     return new AppError(message, 400)
}

const handleDuplicate = err => {
    const message = `Duplicate field value: "${err.keyValue.name}" Please use another value`
    return new AppError(message, 400)
}

const handleJWTErr = () => {
    return new AppError("Invalid Token, Please sign in again",401)
}

const handleTokenExpiredErr = () => {
    return new AppError("Token is expired, Please sign in again",401)
}

const sendErrorProd = err => {
    return new AppError(err.message, 400)
}




// for dev
const sendErrDevelopment = (err,req,res) => {
    // show api 
    // console.log("Ito ang error ->", err,message)
    if (req.originalUrl.startsWith("/api")) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            error: err,
            stack: err.stack
        })
    }
    // for views
    else {
        return res.status(err.statusCode).render("errorPage", {
            title: "Something went wrong",
            msg: err.message
        })
    }
    
}

// for prod
const sendErrProduction = (err,req,res) => {

    // for api 
    if (req.originalUrl.startsWith("/api")) {
        if (err.isOperationError) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message, 
            })
        }

        console.error("ERROR ", err)
        return res.status(err.statusCode).json({
            status: err.status,
            message: `Something went wrong ${err.statusCode}`,
        })
    }

  
    // for views
    if (err.isOperationError) {
        return res.status(err.statusCode).render("errorPage", {
            title: "Something went wrong",
            msg: err.message
        })
    }

    return res.status(err.statusCode).render("errorPage", {
        title: "Something went wrong",
        msg: "Please try again"
    })
}





module.exports = (err,req,res,next) => {
    // console.log("Hit! Global error handler MW",err.stack)
    // console.log("the ERROR OBJ", err.name)
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
        sendErrDevelopment(err,req,res)
    }

    if (process.env.NODE_ENV === "production") {

        //Meron mga error na si mongoose/mongo/etc yung nagcacause dito 
        // minamanupulate natin yung error obj, using the AppError class
        // mag aadd ito ng another property like yung isOperational, bakit?
        // sa prod, error log must be less informative sa user, more on generic term lng
        let error = {...err}
        error.message = err.message
        // console.log(error)
        if (err.name === "CastError") error = handleCastErrorDB(err)
        if (err.code === 11000) error = handleDuplicate(err)
        if (err.name === "ValidationError") error = sendErrorProd(err)
        if (err.name === "JsonWebTokenError") error = handleJWTErr()
        if (err.name === "TokenExpiredError") error = handleTokenExpiredErr()

        sendErrProduction(error,req,res)
    }
}
