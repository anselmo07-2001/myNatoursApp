const morgan = require("morgan")
const express = require("express")
const userRoutes = require("./routes/userRoutes")
const tourRoutes = require("./routes/tourRoutes")
const AppError = require("./utils/appError")

const app = express()

console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV === "development") {
    // app.use(morgan("dev"))
}

app.use(express.json())
app.use(express.static(`${__dirname}/public`))
// app.use((req,res,next) => {
//     console.log("Hello from the middleware")
//     next()
// })
app.use((req,res,next) => {
    req.requestTime = new Date().toISOString()
    next()
})

app.use("/api/v1/users", userRoutes)
app.use("/api/v1/tours", tourRoutes)


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
// kung meron ganito yung signature ng argument sa mw, si express iaasume nya na ito ay global error handling mw function
app.use((err,req,res,next) => {
    console.log(err.stack)
    // dito meron mga error na hindi naka specify yung ano yung status code and status
    // kaya naglalagay dito ng default value
    err.statusCode = err.statusCode || 500
    err.status = err.status || "error"

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    })
})

module.exports = app


// app.get("/api/v1/tours", getTours)
// app.post("/api/v1/tours", createTour)
// app.get("/api/v1/tours/:id", getTour)
// app.patch("/api/v1/tours/:id", updateTour)
// app.delete("/api/v1/tours/:id", deleteTour)