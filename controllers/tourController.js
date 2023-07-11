const fs = require("fs")
const multer = require("multer")
const sharp = require("sharp")
const Tour = require("../model/tourModel")
const APIFeatures = require("../utils/apiFeature")
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")
const handlerFactory = require("../controllers/handlerFactory")


// Configure the multerStorage sa memoryStorage
const multerStorage = multer.memoryStorage();

// filter only images 
const multerFilter = (req,file,cb) => {
	if (file.mimetype.startsWith("image")) {
		cb(null, true);
	}
	else {
		cb(new AppError("Not an image, Please upload only image", 400), false);
	}
}

const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter
})

exports.uploadTourImages = upload.fields([
    { name: "imageCover", maxCount: 1},
    { name: "images", maxCount: 3}
])

exports.resizeTourImages = catchAsync(async (req,res,next) => {
    if (!req.files.imageCover || !req.files.images) return next()

    // Processing cover image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}.jpeg`
    await sharp(req.files.imageCover[0].buffer)
            .resize(2000, 1333)
            .toFormat("jpeg")
            .jpeg({quality: 90})
            .toFile(`public/img/tours/${req.body.imageCover}`)
    
    // Processing images
    req.body.images = []
    await Promise.all(req.files.images.map(async (file,index) => { 
        const filename = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`     
        await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat("jpeg")
                .jpeg({quality: 90})
                .toFile(`public/img/tours/${filename}`)
        
        req.body.images.push(filename)
    }))

    next()
})


exports.aliasTopTours = (req,res,next) => {
    req.query.limit = 5,
    req.query.sort = "-ratingAverage,price"
    req.query.fields = "name,price,difficulty,summary,ratingsAverage"
    next();
}

exports.getTours = handlerFactory.getAll(Tour)
// exports.getTours = catchAsync(async(req,res,next) => {     
//     const feature = new APIFeatures(Tour, req.query)
//                             .filter()
//                             .sort()
//                             .fieldLimiting()
//                             .paginate()

//     const tours = await feature.queryObject
//     res.status(200).json({
//             status: "success",
//             result: tours.length,
//             data: {
//                 tours
//             }
//     })  
// })


exports.getTour = handlerFactory.getOne(Tour, {path: "review"})
// exports.getTour = catchAsync(async (req,res,next) => {
//         //populate() is used to get the actual data using the referencing
//         // using populate() perform also a query
//         const tour = await Tour.findById(req.params.id).populate("review")

//         if (!tour) {
//             return next(new AppError("No tour found with the Id", 404))
//         }

//         res.status(200).json({
//             status: "success",
//             data: {
//                 tour: tour
//             }
//         })
// })


exports.updateTour = handlerFactory.updateOne(Tour)
// exports.updateTour = catchAsync(async (req,res,next) => { 
//         const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//             new: true,
//             runValidators: true,
//         })

//         if (!tour) {
//             return next(new AppError("No tour found with the Id", 404))
//         }

//         res.status(200).json({
//             status: "success",
//             result: 1,
//             data: {
//                 tour
//             }
//         })
// })

exports.deleteTour = handlerFactory.deleteOne(Tour)
// exports.deleteTour = catchAsync(async (req,res,next) => {
//     // console.log("hre", req.params)
//     const tour = await Tour.findByIdAndDelete({ _id : req.params.id })

//     if (!tour) {
//         return next(new AppError("No tour found with the Id", 404))
//     }

//     res.status(204).json({
//         status: "success",
//         data: null
//     })
// })
exports.createTour = handlerFactory.createOne(Tour)

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
                    // IGROUP SILA BASED ON DIFFICULTY
                    // numTours, numRating, etc mga created variable lng sila
                    // na naghohold ng value ng mga ibat ibang operand
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
                //$match is to select or filter some documents
                $match : {
                    startDates: {
                        $gte : new Date(`${year}-01-01`),
                        $lte : new Date(`${year}-12-31`)
                    }
                }
            },
            {
                //nagrgroup sila based on the _id 
                $group : {
                    _id : { $month : "$startDates"},
                    numTourStart : { $sum : 1}, // if 5 yung tourstart magiincremnt to ng 5timesk
                    tours : { $push: "$name" },   
                }
            },
            {
                $addFields : { month : "$_id"}
            },
            {
                $project : { _id : 0} // 0 = REMOVE
            },
            {
                $sort : { numTourStart: -1} // -1 = DESC
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


//Get nearby tours based on user current locations and inputed radius
// /tours-within/:distance/center/:latlng/unit/:unit
exports.getToursWithin = catchAsync(async (req,res,next) => {
    const { distance, latlng, unit} = req.params
    const [lat, lng] = latlng.split(",")

    // $centerSphere uses some special units now use this formula depend on the units provided
    const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1

    if (!lat || !lng) {
        return next(new AppError("Please Provide latitude, longitude in the format of lat,lng", 400))
    }

    const tours = await Tour.find({ 
        startLocation : { $geoWithin: { $centerSphere : [[lng,lat], radius]}}
    })
    

    res.status(200).json({
        status:"success",
        result: tours.length,
        data: {
            data: tours
        }
    })
})


exports.getDistances = catchAsync(async(req,res,next) => {
    const { latlng, unit} = req.params
    const [lat, lng] = latlng.split(",")

    const multiplier = unit === "mi" ? 0.000621371 : 0.001;

    if (!lat || !lng) {
        return next(new AppError("Please Provide latitude, longitude in the format of lat,lng", 400))
    }

    // to calculate yung layo ng latlng ni user at sa tour
    // $geoNear must be the first operantor sa pipeline
    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [lng * 1, lat * 1]
                },
                //yung mga computed distance, sa "distance" field ilalagay
                distanceField: "distance",
                distanceMultiplier: multiplier
            },
        },
        {
            $project: {
                distance: 1,
                name: 1
            }     
        }
    ])

    res.status(200).json({
        status:"success",
        data: {
            data: distances
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