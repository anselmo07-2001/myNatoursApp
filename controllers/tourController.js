const fs = require("fs")
const Tour = require("../model/tourModel")
const APIFeatures = require("../utils/apiFeature")
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")


exports.aliasTopTours = (req,res,next) => {
    req.query.limit = 5,
    req.query.sort = "-ratingAverage,price"
    req.query.fields = "name,price,difficulty,summary,ratingsAverage"
    next();
}


exports.getTours = catchAsync(async(req,res,next) => {     
    const feature = new APIFeatures(Tour, req.query)
                            .filter()
                            .sort()
                            .fieldLimiting()
                            .paginate()

    const tours = await feature.queryObject
    res.status(200).json({
            status: "success",
            result: tours.length,
            data: {
                tours
            }
    })
    
})

exports.getTour = catchAsync(async (req,res,next) => {
        const tour = await Tour.findById(req.params.id)

        if (!tour) {
            return next(new AppError("No tour found with the Id", 404))
        }

        res.status(200).json({
            status: "success",
            data: {
                tour: tour
            }
        })
})

exports.updateTour = catchAsync(async (req,res,next) => { 
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })

        if (!tour) {
            return next(new AppError("No tour found with the Id", 404))
        }

        res.status(200).json({
            status: "success",
            result: 1,
            data: {
                tour
            }
        })
})

exports.deleteTour = catchAsync(async (req,res,next) => {
    // console.log("hre", req.params)
    const tour = await Tour.findByIdAndDelete({ _id : req.params.id })

    if (!tour) {
        return next(new AppError("No tour found with the Id", 404))
    }

    res.status(204).json({
        status: "success",
        data: null
    })
})


exports.createTour = catchAsync(async(req,res,next) => {
        const tour = await Tour.create(req.body)
        res.status(201).json({
            status: "success",
            data: {
                tour
            }
        })  
})

exports.getTourStats = catchAsync(async (req,res,next) => {
        // this is the aggregation pipeline, it just a regular query
        // Each document dadaan sa pipeline nayan
        // the data goes to the pipeline at different stages
        // the first stages is $match
        //if you await it it return the query result if you dont it return an aggregate obj
        const stats = await Tour.aggregate([
            {
                $match : {
                    ratingsAverage : { $gte : 4.5 }         
                }
            },
            {
                $group : {
                    _id : {$toUpper : "$difficulty"},
                    numTours : { $sum : 1},
                    numRatings : { $sum : "$ratingQuantity"},
                    avgRating : { $avg : "$ratingsAverage"},
                    avgPrice :  { $avg : "$price"},
                    minPrice : { $min : "$price"},
                    maxPrice : { $max : "$price"}
                }
            },
            {
                $sort : {
                    ratingsAverage : 1
                }
            },
            // {
            //     $match : {
            //         // dito sa 3rd stage, hindi nanaten kaya iselect yung dating field nung query
            //         // maseselect nlng natin yung mga field na ginawa sa grouping stage
            //         // dito sinelect nating is _id 
            //         _id : { $ne : "EASY"}
            //     }
            // }
        ])

        res.status(200).json({
            status: "success",
            result: stats.length,
            data: {
                stats
            }
        })
})

//this function calculate which month is the most busy
// to calculate that, determine how many tours in a month, 
// the highest number of tours in a certain month is the most busy
exports.getMonthlyPlan = catchAsync(async (req,res,next) => {
        const year = req.params.year * 1

        const plan = await Tour.aggregate([
            {
                //$unwind operator, will deconstructs an array from the document
                // if lets say 3 elements yung array, 3 rin yung magiging output na document
                $unwind : "$startDates"
            }, 
            {
                $match : {
                    startDates: {
                        $gte : new Date(`${year}-01-01`),
                        $lte : new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group : {
                    _id : { $month : "$startDates"},
                    numTourStart : { $sum : 1},
                    tours : { $push: "$name" },   
                }
            },
            {
                $addFields : { month : "$_id"}
            },
            {
                $project : { _id : 0}
            },
            {
                $sort : { numTourStart: -1}
            }
        ])

        res.status(200).json({
            status: "success",
            result: plan.length,
            data: {
                plan
            }
        })
})





//////////////////////////////////////////////////////////////////////////////



// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))

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

    //Basic Filtering
    // let query = {...req.query}
    // //if you dont exclude this, functionally of this will not work why??
    // // you need to remove the sort, page, limit field because they are special query params
    // // sort,page,limit,fields hindi dapat gamitin to query ng database
    // const excludeQuery = ["sort", "page", "limit", "fields"]
    // excludeQuery.forEach((value) => delete query[value])


    //Advance filtering
    // let queryString = JSON.stringify(query)
    // queryString = JSON.parse(queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`))
    // query = Tour.find(queryString)

    //Sorting
    // if (req.query.sort) {
    //     //sorting multiple criteria, dapat ganito sort("price ratingsAverage")
    //     const sortOption = req.query.sort.split(",").join(" ")
    //     queryString = query.sort(sortOption)
    // }else {
    //     query.sort("-createdAt")
    // }


    //Projecting or Field Limiting
    // if (req.query.fields) {
    //     console.log("true", req.query.fields)
    //     const fields = req.query.fields.split(",").join(" ")
    //     query.select(fields)
    // }
    // else {
    //     query.select("-__v")
    // }


    //Pagination
    // const limit = req.query.limit * 1 || 100
    // const page = req.query.page * 1|| 1
    // const skip = ( page - 1) * limit

    // query.skip(skip).limit(limit)