const dotenv = require("dotenv")
dotenv.config({path: "./config.env"})

//handling uncaught exception
//If uncaught exception occur in prod, there is a tool allow to 
// restart the app
process.on("uncaughtException", (err) => {
    console.log("UNCAUGHT EXCEPTION !!!! SYSTEM SHUTTING DOWN....")
    console.log(err.name, err.message)

    // Shut down the app, if this error occur
    // no need na ishutdown yung server muna, kasi this are synchronous code
    process.exit(1)
})


const app = require("./app")
const mongoose = require("mongoose")

// console.log(process.env.MONGODB_URL)

const localDB = process.env.MONGODB_URL;
const remoteDB = process.env.ATLAS_DB_REMOTE_URL.replace("<PASSWORD>", process.env.ATLAS_DB_PASSWORD);

const DB = process.env.NODE_ENV === 'production' ? remoteDB : localDB;


mongoose.connect(DB, {
    useCreateIndex: true,
    useUnifiedTopology:  true,
    useNewUrlParser: true,
    useFindAndModify: false,
}).then(() => console.log("Connected to Database"))
// .catch(err => console.log("ERROR", err)) // error handling in the global error mw fn

const PORT = process.env.PORT || 3000

const server = app.listen(PORT, () => {
    console.log("Listening to port ", PORT)
})

//Sometimes error occur like, outside of the system like crashing the dabatase
// still there is a way to handle this, by shutdown the app and logging the error
// if promise rejection( unhandledRejection ) happen somewhere in the app
// we can listen to it like this
process.on("unhandledRejection", (err) => {
    console.log(err.name, err.message)
    console.log("UNHANDLED REJECTION !!!! SYSTEM SHUTTING DOWN....")

    //Shut down the app, if this error occur
    // close the server first, kasi wait tapusin like yung mga pending request
    // then shutdown yung system
    // sa prod, kapag ng occur ganitong error, may way to fix, it
    server.close(() => {
        process.exit(1)
    })
})

