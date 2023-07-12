const Tour = require("./../model/tourModel")
const catchAsync = require("./../utils/catchAsync")
const AppError = require("./../utils/appError")
const User = require("./../model/userModel")
const Booking = require("./../model/bookingModel")

exports.getOverview = catchAsync(async(req,res) => {
    const tours = await Tour.find()

    res.status(200).render("overview", {
        tours,
        title: 'Natours | Exciting tours for adventurous people'
    })
})

exports.getTour = catchAsync(async(req,res,next) => {
    const tour = await Tour.findOne({ slug: req.params.slug })
    .populate({
         path: "reviews", //name ng virtual property na sinet sa virtual populates
         fields: "review" //fields na ififiter sa output
    })
    
    if (!tour) {
        return next(new AppError("Tour with that name dont exits", 404))
    }

    res.status(200).render("tour", {
        tour,
        title: `Natours | ${tour.name}`
    })
})

exports.getLoginForm = async(req,res) => {


    res.status(200).render("loginForm", {
        title: "Log into your account"
    })
}

exports.getSignUpForm = async(req,res) => {
    res.status(200).render("signupForm", {
        title: "Sign up your account"
    })
}


exports.getAccount = async(req,res) => {
    
    res.status(200).render("accountTemplate", {
        title: "Log into your account",
        user: req.user
    })
}

exports.updateUserData = async(req,res) => {
    const { name, email } = req.body
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
        name, email
    }, {
        new: true,
        runValidators: true
    })



    res.status(200).render("accountTemplate", {
        user: updatedUser
    })
}

exports.getMyTours = async(req,res,next) => {
    // find All bookings
    const bookings = await Booking.find({user: req.user.id})

    // returned all the toursId
    const toursId = await bookings.map(booking => booking.tour)

    const tours = await Tour.find({_id : { $in : toursId} })

    res.status(200).render("overview", {
        tours,
        title: "My Tours",
        user: req.user
    })

}

