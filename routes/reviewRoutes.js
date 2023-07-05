const express = require("express")
const authController = require("../controllers/authController")
const reviewController = require("../controllers/reviewController")

// By default router can only access params of their route, when mergeParams set to true
// we can access the params of the other route nested to this route
const router = express.Router({mergeParams: true})

// Run this MW before other route
router.use(authController.protect)

// GET  /tours/:tourId/reviews
// POST /tours/:tourId/reviews
router.route("/")
      .get(reviewController.getAllReview)
      .post(authController.restrictTo("user"),
            reviewController.setUpUserIdAndTourId,
            reviewController.createReview)
                  

router.route("/:id")
      .patch(authController.restrictTo("user","admin"), reviewController.updateReview)
      .get(reviewController.getReview)
      .delete(authController.protect, 
              authController.restrictTo("user","admin"),
              reviewController.deleteReview)


module.exports = router