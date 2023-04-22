const morgan = require("morgan")
const express = require("express")
const userRoutes = require("./routes/userRoutes")
const tourRoutes = require("./routes/tourRoutes")

const app = express()

console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV === "development") {
    // app.use(morgan("dev"))
}
app.use(express.json())
app.use(express.static(`${__dirname}/public`))
app.use((req,res,next) => {
    console.log("Hello from the middleware")
    next()
})
app.use((req,res,next) => {
    req.requestTime = new Date().toISOString()
    next()
})

app.use("/api/v1/users", userRoutes)
app.use("/api/v1/tours", tourRoutes)


module.exports = app


// app.get("/api/v1/tours", getTours)
// app.post("/api/v1/tours", createTour)
// app.get("/api/v1/tours/:id", getTour)
// app.patch("/api/v1/tours/:id", updateTour)
// app.delete("/api/v1/tours/:id", deleteTour)