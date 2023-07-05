const catchAsync = require("./../utils/catchAsync")
const AppError = require("./../utils/appError")
const APIFeatures = require("./../utils/apiFeature")

exports.deleteOne = Model => catchAsync(async (req,res,next) => {
    const doc = await Model.findByIdAndDelete({ _id : req.params.id })

    if (!doc) {
        return next(new AppError("No document with that Id", 404))
    }

    res.status(204).json({
        status: "success",
        data: null
    })
})

exports.updateOne = Model => catchAsync(async (req,res,next) => { 
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    })

    if (!doc) {
        return next(new AppError("No doc found with the Id", 404))
    }

    res.status(200).json({
        status: "success",
        result: 1,
        data: {
            data: doc
        }
    })
})

exports.createOne = Model => catchAsync(async(req,res,next) => {
    const doc = await Model.create(req.body)
    res.status(201).json({
        status: "success",
        data: {
            data: doc
        }
    })  
})


exports.getOne = (Model, populateOption) => catchAsync(async (req,res,next) => {
    let query = Model.findById(req.params.id)
    if (populateOption) {
        query = query.populate(populateOption)
    }
    const doc = await query
    res.status(200).json({
        status: "success",
        data: {
            data: doc
        }
    })
})

exports.getAll = (Model) => catchAsync(async(req,res,next) => {   
    
    //To allow for nested GET review on ( hack )
    let filterReview = {}
    if (req.params.tourId) filterReview = { tour: req.params.tourId}

    const feature = new APIFeatures(Model.find(filterReview), req.query)
                            .filter()
                            .sort()
                            .fieldLimiting()
                            .paginate()

    // const docs = await feature.queryObject.explain()
    const docs = await feature.queryObject
    
    res.status(200).json({
            status: "success",
            result: docs.length,
            data: {
                data: docs
            }
    })
    
})




