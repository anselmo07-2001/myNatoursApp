const dotenv = require("dotenv")
dotenv.config({path: `${__dirname}/../../config.env`})
const fs = require("fs")
const mongoose = require("mongoose")


const Tour = require("../../model/tourModel")
const User = require("./../../model/userModel")
const Review = require("./../../model/reviewModel")

mongoose.connect(process.env.MONGODB_URL , {
    useCreateIndex: true,
    useUnifiedTopology:  true,
    useNewUrlParser: true
},() => {
    console.log("connected to db")
})

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, "utf-8"))
const users =  JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"))

const importData = async () => {
    try {
        await Tour.create(tours)
        await User.create(users, { validateBeforeSave: false})
        await Review.create(reviews)
        console.log("Data is succesfully inserted")
    }
    catch(err) {
        console.log(err)
    }

    process.exit()
}

const deleteData = async () => {
    try {
        await Tour.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
        console.log("Data is succesfully delete")
    }
    catch(err) {
        console.log(err)
    }

    process.exit()
}

if (process.argv[2] === "--delete") {
    deleteData()
}

if (process.argv[2] === "--import") {
    importData()
}




