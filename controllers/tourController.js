const fs = require("fs")
const Tour = require("../model/tourModel")
// ./dev-data/data/tours-simple.json"
const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))

// exports.checkId = (req,res,next,val) => {
//     const id = req.params.id * 1
    
//     const tour = tours.find(tour => tour.id === id)

//     if (!tour) {
//         return res.status(404).json({
//             status: "failed",
//             message: "invalid id"
//         })
//     }

//     req.tour = tour
//     next()
// }


// exports.checkBody = (req,res,next) => {
//     if(!req.body.name || !req.body.price) {
//          return res.status(400).json({
//             status: "failed",
//             message: "name or price is missing"
//         })
//     }
//     next()
// }


exports.aliasTopTours = (req,res,next) => {
    req.query.limit = 5,
    req.query.sort = "-ratingAverage,price"
    req.query.fields = "name,price,difficulty,summary,ratingsAverage"
    next();
}



exports.getTours = async(req,res) => { 

    //Basic Filtering
    let query = {...req.query}
    //if you dont exclude this, functionally of this will not work why??
    // you need to remove the sort, page, limit field because they are special query params
    // sort,page,limit,fields hindi dapat gamitin to query ng database
    const excludeQuery = ["sort", "page", "limit", "fields"]
    excludeQuery.forEach((value) => delete query[value])


    //Advance filtering
    let queryString = JSON.stringify(query)
    queryString = JSON.parse(queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`))
    query = Tour.find(queryString)

    //Sorting
    if (req.query.sort) {
        //sorting multiple criteria, dapat ganito sort("price ratingsAverage")
        const sortOption = req.query.sort.split(",").join(" ")
        queryString = query.sort(sortOption)
    }else {
        query.sort("-createdAt")
    }


    //Projecting or Field Limiting
    if (req.query.fields) {
        console.log("true", req.query.fields)
        const fields = req.query.fields.split(",").join(" ")
        query.select(fields)
    }
    else {
        query.select("-__v")
    }


    //Pagination
    const limit = req.query.limit * 1 || 100
    const page = req.query.page * 1|| 1
    const skip = ( page - 1) * limit

    query.skip(skip).limit(limit)
    

    const tours = await query

    try {
        res.status(200).json({
            status: "success",
            result: tours.length,
            data: {
                tours
            }
        })
    }
    catch(err) {
        res.status(500).json({
            status: "error",
            message: `Something went wrong ${err}`
        })
    }
    
}

exports.getTour = async (req,res) => {
    try {
        const tour = await Tour.findById(req.params.id)
        res.status(200).json({
            status: "success",
            data: {
                tour: tour
            }
        })
    }
    catch(err) {
        res.status(500).json({
            status: "error",
            message: `Something went wrong ${err}`
        })
    }

}

exports.updateTour = async (req,res) => {

    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })
        res.status(200).json({
            status: "success",
            result: 1,
            data: {
                tour
            }
        })
    }
    catch(err) {
        res.status(500).json({
            status: "error",
            message: `Something went wrong ${err}`
        })
    }
    
}

exports.deleteTour = async (req,res) => {
    console.log("hre", req.params)
    try {
        await Tour.findByIdAndDelete({ _id : req.params.id })
        res.status(204).json({
            status: "success",
            data: null
        })
    }
    catch(err) {
        res.status(500).json({
            status: "error",
            message: `Something went wrong ${err}`
        })
    }
  
}

exports.createTour = async(req,res) => {

    try {
        const tour = await Tour.create(req.body)
        res.status(201).json({
            status: "success",
            data: {
                tour
            }
        })
    }
    catch(err) {
        res.status(500).json({
            status: "error",
            message: `Something went wrong ${err}`
        })
    }


    // const newId = new Date().getTime()
    // const newTour = {
    //     id : newId,
    //     ...req.body
    // }

    // tours.push(newTour)
    // fs.writeFile("./dev-data/data/tours-simple.json", JSON.stringify(tours), (err,data) => {
    //     res.status(201).json({
    //         status: "success",
    //         result: tours.length,
    //         data: {
    //             newTour
    //         }
    //     })
    // })   
}