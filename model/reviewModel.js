const mongoose = require("mongoose")
const Tour = require("./tourModel")


const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, "Review must contain desciption"]
    },
    rating: {
        type: Number,
        min:1,
        max:5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: "Tour",
        required: [true, "Review must belong to a tour"]
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "User must belong to a tour"]
    }
}, {
    toJSON: { virtuals: true},
    toObject: { virtuals: true}
})


reviewSchema.pre(/^find/, async function(next) {
    this.populate({
        path: "user",
        select: "name photo"
    })
    next()
})

//When naka index then naka unique sila, sina tour at user must be unique
//If gagawa ng review yung isang user sa isang tour multiple times it will not work 
// only one time
reviewSchema.index({ tour: 1, user: 1}, { unique: true })



//Everytime na meron nagcecreate ng review, 
// naguupdate yung ratingsQuantity and ratingsAverage ng isang tour na binigyan ng review
reviewSchema.statics.calcAverageRatings = async function(tourId) {

    const result = await this.aggregate([
        {
            $match: { tour : tourId}
        },
        {
            $group: {
                _id : "$tour",
                nRatings : { $sum : 1},
                avgRatings: { $avg : "$rating" },
            }
        }
    ])

    if (result.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: result[0].avgRatings,
            ratingsQuantity: result[0].nRatings
        })
    }
    else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: 4.5,
            ratingsQuantity: 0
        })
    }
  
}

//Everytime na meron review nakinicreate update the avgrating of the tour
reviewSchema.post("save", function() {
    //this constructor points to the current model which is the reviewmodel
    this.constructor.calcAverageRatings(this.tour)
})



//Everytime na meron nadedelete or nauupdate na review, 
//naguupdate din yung avgRating nung tour na nareview
reviewSchema.pre(/^findOneAnd/, async function(next) {
    //the problem with query mw, this keyword point to the current query
    //so dito kinuha dito yung currentReview kasi nandito yung tourId 
    //then store yung currentReview sa this keyword, then si post query mw sya ang magproprocess
    this.currentReview = await this.findOne()
    next()
})

reviewSchema.post(/^findOneAnd/, async function() {
    // unlike sa document mw yung this.contructor point sa model
    // sa query mw yung this.currentReview.contructor point to model
    await this.currentReview.constructor.calcAverageRatings(this.currentReview.tour)
})






const reviewModel = mongoose.model("Review", reviewSchema)
module.exports = reviewModel