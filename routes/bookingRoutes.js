const express = require("express")
const authController = require("../controllers/authController")
const bookingController = require("../controllers/bookingController")

const router = express.Router()

router.use(authController.protect)

router.get("/checkout-session/:tourId",
            bookingController.getCheckoutSession)

router.use(authController.restrictTo("admin","lead-guide"))

router.route("/:id")
      .delete(bookingController.deleteBooking)
      .get(bookingController.getBooking)
      .patch(bookingController.updateBooking)

router.route("/")
      .get(bookingController.getAllBookings)
      .post(bookingController.createBooking)


module.exports = router