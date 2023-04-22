const dotenv = require("dotenv")
dotenv.config({path: "./config.env"})

const app = require("./app")
const mongoose = require("mongoose")

console.log(process.env.MONGODB_URL)

mongoose.connect(process.env.MONGODB_URL , {
    useCreateIndex: true,
    useUnifiedTopology:  true,
    useNewUrlParser: true
},() => {
    console.log("connected to db")
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log("Listening to port ", PORT)
})

