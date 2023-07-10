const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const catchAsync = require("../utils/catchAsync")
const Tour = require("../model/tourModel")
const Booking = require("../model/bookingModel")
const AppError = require("../utils/appError")
const handlerFactory = require("../controllers/handlerFactory")

exports.getCheckoutSession = catchAsync(async(req,res,next) => {
    const tour = await Tour.findById(req.params.tourId)

    //Create the stripe checkout sessions
    const sessions = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        // sucess_url value is not secure kasi, if alam nila itong route nato, they can use
        // it to make book for free, so ang temporary solution after, matrigger itong route,
        // ireredirect agad ito sa home page
        // success_url: `${req.protocol}://${req.get("host")}/`,
        success_url: `${req.protocol}://${req.get("host")}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: ["https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
                    },
                    unit_amount:  tour.price * 100 //amount property accept by cents
                },
                quantity: 1,
            }
        ],
        mode: "payment"
    })

    res.status(200).json({
        status: "success",
        sessions  
    })
})


exports.createBookingCheckout = catchAsync (async (req,res,next) => {
    // Unsecured Temporary Solution: Mas better WebHooks
    const { tour, user, price } = req.query
    console.log("tour, user, price ->", tour,user,price)

    if (!tour && !user && !price) return next()
    await Booking.create({tour, user, price})
    // req.orginalUrl is the current url, 
    // res.redirect, this redirect the route, creating another request
    res.redirect(req.originalUrl.split("?")[0])
})


exports.deleteBooking = handlerFactory.deleteOne(Booking)
exports.updateBooking = handlerFactory.updateOne(Booking)
exports.getAllBookings = handlerFactory.getAll(Booking)
exports.getBooking = handlerFactory.getOne(Booking)
exports.createBooking = handlerFactory.createOne(Booking)