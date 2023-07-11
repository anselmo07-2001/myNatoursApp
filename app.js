const path = require("path")
const morgan = require("morgan")
const express = require("express")
const rateLimiter = require("express-rate-limit")
const helmet = require("helmet")
const mongoSanitizer = require("express-mongo-sanitize")
const xssClean = require("xss-clean")
const hpp = require("hpp")
const cookieParser = require("cookie-parser")
const compression = require("compression")

const userRoutes = require("./routes/userRoutes")
const tourRoutes = require("./routes/tourRoutes")
const reviewRoutes = require("./routes/reviewRoutes")
const viewRoutes = require("./routes/viewRoutes")
const bookingRoutes = require("./routes/bookingRoutes")

const AppError = require("./utils/appError")
const globalErrorHandler = require("./controllers/errorController")


const app = express()
app.set("view engine", "pug")
app.set("views", path.join(__dirname, "views"))
app.use(express.static(path.join(__dirname, "public")))





console.log("Stage: ",process.env.NODE_ENV)
if (process.env.NODE_ENV === "development") {
    // app.use(morgan("dev"))
}


//Set security http header
app.use(helmet())

// Request max is 100 in each 1hr
const limiter = rateLimiter({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Too many request from this IP, Please try again in an hour"
})

// affect all routes, all routes start in /api
app.use("/api", limiter)

//BodyParser and cookie parser
app.use(express.json({limit: "10kb" }))
app.use(cookieParser())
app.use(express.urlencoded({extended: true, limit: "10kb"}))

// Data Sanitize against nosql query injections
app.use(mongoSanitizer())

// Data Sanitize against xss
app.use(xssClean())

//Prevent parameter pollutions
app.use(hpp({
    whitelist: ["duration","ratingsQuantity","ratingsAverage","maxGroupSize","difficulty","price"]
}))

// every response, it compress to smaller size
app.use(compression())

// app.use((req,res,next) => {
//     // console.log("Hello from the middleware", req.cookies)
//     next()
// })
app.use((req,res,next) => {
    req.requestTime = new Date().toISOString()
    next()
})


//this is also called mounting a router
// userRoutes and tourRoutes are router
app.use("/", viewRoutes)
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/tours", tourRoutes)
app.use("/api/v1/reviews", reviewRoutes)
app.use("/api/v1/bookings", bookingRoutes)


//Handling Unhandle Route
app.all("*", (req,res,next) => {
    // Kinoment na dito yung response ng unhandle route kasi si global err handler mw na bahala
    // res.status(404).json({
    //     status: "fail",
    //     message: `Cant find the ${req.originalUrl} in the server`
    // })

    // Kinomnet na ito kasi hindi na gagamitin meron ng ginawang class para dito
    // const err = new Error(`Cant find the ${req.originalUrl} in the server`)
    // err.statusCode = 404
    // err.status = "fail"

    const err = new AppError(`Cant find the ${req.originalUrl} in the server`, 404)
    //if you pass any argument in the next function, express assume na ito ay error
    // then pupunta ito sa global error handler 
    next(err)
})

//Creating a global error handler middleware
// kung meron ganito yung signature ng argument sa mw sa first arg nya is err, si express iaasume nya na ito ay global error handling mw function
app.use(globalErrorHandler)

module.exports = app


// app.get("/api/v1/tours", getTours)
// app.post("/api/v1/tours", createTour)
// app.get("/api/v1/tours/:id", getTour)
// app.patch("/api/v1/tours/:id", updateTour)
// app.delete("/api/v1/tours/:id", deleteTour)