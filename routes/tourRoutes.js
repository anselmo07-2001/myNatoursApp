const express = require("express")
const tourController = require("../controllers/tourController")
const authController = require("../controllers/authController")
const reviewRouter = require("./reviewRoutes")
const router = express.Router()  // -> /api/v1/tours

// router.param("id", tourController.checkId)

//Simple nested Route
// this route is counter intuitive because tourRoute contains some reviewController
// better use router.use()
 // router.route("/:tourId/reviews")
 //       .post(authController.protect,
 //             authController.restrictTo("user"),
 //             reviewController.createReview)

// Another way to implement nestedRoute
// the reviewRouter dont know how to access the tourId params so use mergeParams:true
// By default router can only access params of their route this is why we use mergeParams
router.use("/:tourId/reviews", reviewRouter)

router.route("/top-cheap-tour")
.get(tourController.aliasTopTours, tourController.getTours)

router.route("/monthly-plan/:year")
.get(authController.protect, 
     authController.restrictTo("admin","lead-guide","guide"),
     tourController.getMonthlyPlan)


router.route("/tour-stats")
.get(tourController.getTourStats)

router.route("/tours-within/:distance/center/:latlng/unit/:unit")
      .get(tourController.getToursWithin)

router.route("/distances/:latlng/unit/:unit")
      .get(tourController.getDistances)

router.route("/")
.get(tourController.getTours)
.post(authController.protect,
      authController.restrictTo("admin","lead-guide")
     ,tourController.createTour)

router.route("/:id")
.get(tourController.getTour)
.patch(authController.protect, 
       authController.restrictTo("admin","lead-guide"),
       tourController.uploadTourImages,
       tourController.resizeTourImages,
       tourController.updateTour)
.delete(authController.protect, 
        authController.restrictTo("admin","lead-guide"),
        tourController.deleteTour)




module.exports = router