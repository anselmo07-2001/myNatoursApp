const mongoose = require("mongoose")

const TourSchema = new mongoose.Schema({
      name: {
          type: String,
          required: [true, "A tour must have a name"],
          unique: true,
          trim: true
      },
      duration: {
        type: Number,
        required: [true, "A tour must have a duration"]
      },
      maxGroupSize: {
        type: Number,
        required: [true, "A tour must have a maximum group size"]
      },
      difficulty: {
        type: String,
        required: [true, "A tour must have a difficulty"],
        trim: true,
      },
      ratingsAverage: {
        type: Number,
        default: 4.5
      },
      ratingsQuality: {
        type: Number,
        default: 0
      },
      priceDiscount: Number,
      summary: {
        type: String,
        trim: true
      },
      description: {
        type: String,
        trim: true
      },
      imageCover: {
        type: String,
        required: [true, "A tour must have a image cover"]
      },
      images: {
        type: [String]
      },
      createdAt: {
        type: Date,
        default: Date.now(),
      },
      startDates: {
        type: [Date]
      },
      price: {
        type: Number,
        required: [true, "A tour must have a price"]
      }
})

const TourModel = mongoose.model("Tour", TourSchema)

module.exports = TourModel