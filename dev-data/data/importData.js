const dotenv = require("dotenv")
dotenv.config({path: `${__dirname}/../../config.env`})
const fs = require("fs")
const mongoose = require("mongoose")


const Tour = require("../../model/tourModel")

mongoose.connect(process.env.MONGODB_URL , {
    useCreateIndex: true,
    useUnifiedTopology:  true,
    useNewUrlParser: true
},() => {
    console.log("connected to db")
})

const devData = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, "utf-8"))

const importData = async () => {
    try {
        await Tour.create(devData)
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




