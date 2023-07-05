const reviewModel = require("./../model/reviewModel")
const handlerFactory = require("./handlerFactory")
const catchAsync = require("./../utils/catchAsync")


exports.getAllReview = handlerFactory.getAll(reviewModel)
// exports.getAllReview = catchAsync(async (req,res,next) => {
//     //To allow for nested GET review on
//     let filterReview = {}
//     if (req.params.tourId) filterReview = { tour: req.params.tourId}

//     const reviews = await reviewModel.find(filterReview)

//     res.status(200).json({
//         status: "success",
//         result: reviews.length,
//         data: {
//             reviews
//         }
//     })
// })

//this handler use as a mw, before creating review this will run first
// its setup the tour anad the user based on the params and the user.id
exports.setUpUserIdAndTourId = catchAsync(async (req,res,next) => {
      //Allow nested route
      if (!req.body.tour) req.body.tour = req.params.tourId
      if (!req.body.user) req.body.user = req.user.id

      next()
})


exports.createReview = handlerFactory.createOne(reviewModel)
// exports.createReview = catchAsync(async (req,res,next) => {
  
//     const review = await reviewModel.create(req.body)

//     res.status(200).json({
//         status: "success",
//         data: {
//            review
//         }
//     })
// })

exports.deleteReview = handlerFactory.deleteOne(reviewModel)
exports.updateReview = handlerFactory.updateOne(reviewModel)
exports.getReview = handlerFactory.getOne(reviewModel)

