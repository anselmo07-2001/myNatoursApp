const mongoose = require("mongoose")
const slugify = require("slugify")

const TourSchema = new mongoose.Schema({
      name: {
          type: String,
          required: [true, "A tour must have a name"],
          unique: true,
          trim: true,
          maxLength: [40, "A tour name must have maximum of 40 characters"],
          minLength: [10, "A tour name must have minimum of 10 characters"]
      },
      slug : String,
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
        enum : {
            values : ["easy", "difficult", "medium"],
            message : "Difficulty is either: easy, medium, difficult"
        }
      },
      ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, "Rating Average must be above 1.0"],
        max: [5, "Rating Average must be below 5.0"]
      },
      ratingsQuality: {
        type: Number,
        default: 0
      },
      summary: {
        type: String,
        trim: true
      },
      description: {
        type: String,
        trim: true
      },
      secretTour: {
         type: Boolean,
         default: false
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
      },
      priceDiscount: {
        type: Number,
        validate: {
           // this, point to the current object when its creating data
           // it will not work in updating a data or updating document
           validator: function(val) {
                return val < this.price
           },
           message: "Error! Discount must be lower than the price"
        }
      }
}, {
  toJSON : { virtuals: true},
  toObject : { virtuals : true}
})
//Creating Virtual Properties
// Virtual properties are not persisted to db, they can be used to derived other field
// kapag meron get request makecreate itong virtual properties
// then defined it to the schema 2nd argument
TourSchema.virtual("durationWeeks").get(function() {
  return this.duration / 7
})


//Creating Document Middleware, document MW trigger in save() and create() mongoose method
// this, point to the current process document in the pre hook
TourSchema.pre("save", function (next) {
    this.slug = slugify(this.name, {lower: true})
    next()
})

// doc is the finish process document
TourSchema.post("save", function(doc,next) {
     console.log(doc)
     next()
})


//Creating Query Middle, this hook, execute before/after an query
// using regular expresion the ^ mean this will work in any query that start with "find"
//like findOne, findById
TourSchema.pre(/^find/, function (next){
    // this query will run first before the actual querys
    this.find({ secretTour : { $ne : true}})
    next()
})




// Creating Aggregation Middleware, trigger when something perform aggregation 
// this, point to the current processs aggregation object
// dito sa middleware nato, nagadd tayo ng another stage dun sa pipeline 
// na kung saan reniremove yung mag secretTour set to true,
TourSchema.pre("aggregate", function(next) {
  this.pipeline().unshift({
      $match : {
          secretTour : { $ne : true}
      }
  })

  console.log(this.pipeline())
  next()
}) 
 



const TourModel = mongoose.model("Tour", TourSchema)

module.exports = TourModel