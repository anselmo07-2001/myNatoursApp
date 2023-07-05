const mongoose = require("mongoose")
const slugify = require("slugify")
const userModel = require("./userModel")

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
        max: [5, "Rating Average must be below 5.0"],
        //everytime na meron new value sa field nato, nagrurun itong setter fn
        set: (val) => Math.round(val * 10) / 10 
      },
      ratingsQuantity: {
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
      //this field "startLocation" is not a document itself, it just an obj describing
      // the certain point sa earth, need natin ng another field to embed location document
      startLocation : {
          //In order marecognize ni mongoose na geojson ito ganito syntax
          type: {
            type: String,
            default: "Point",
            enum: ["Point"]
          },
          //NOTE: una longitude bago latitude
          coordinates: [Number],
          address: String,
          description: String
      },
      // dito mageembed ng locations document
      // to embedded location, use array
      locations: [
        {
          type: {
            type: String,
            default: "Point",
            enum: ["Point"]
          },
          coordinates: [Number],
          address: String,
          description: String,
          // day is the day when to arrive 
          day: Number  
        }
      ],
      //child referencing, 
      // in order to replace this with the actual data used populate
      // using populate para lng syang inimbeded pero infact seperate ang mga datasets
      guides: [
         {
            type: mongoose.Schema.ObjectId,
            ref: "User" // name ng model
         }
      ],
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
  // kapag meron virtual properties sa field and gusto naten kasali sila sa output
  // need ilagay ito, if magooutput ng json or object, isasali yung mga virtual prop
  toJSON : { virtuals: true},
  toObject : { virtuals : true}
})


//Indexing will make the read performance great for only when it query to price
// use indexing to a field that query the most
// 1 is order ascending, -1 is order descending
// there are other type of index for string or geospatial but in number 1 or -1
// TourSchema.index({ price: 1}) 
TourSchema.index({ price: 1, ratingsAverage: -1}) //mas better kung compound index, 2 or more index
TourSchema.index({ slug : 1})
//sinasabi natin na itong startLocation dapat maindex sya as a 2dsphere
TourSchema.index({ startLocation: "2dsphere"}) 



//Creating Virtual Properties
// Virtual properties are not persisted to db, they can be used to derived other field
// kapag meron get request makecreate itong virtual properties
// then defined it to the schema 2nd argument
TourSchema.virtual("durationWeeks").get(function() {
  return this.duration / 7
})


// Virtual Populate, each tour wala silang access sa kanilang review, 
// dahil parent referencing ang gamit, use virtual populate to access the review in each tour
TourSchema.virtual("reviews", { //ito yung virtual names ng field mo
    ref: "Review", //name ng model
    //yung foreignField, ito yung field to get the data sa Review collections
    //ang value ni tour field ay isang tour id, now gagamitin si localField na yung
    //value nya yung tour id, 
    //mahahanap ni mongoose yung mga tours sa review kasi imamatch yung yung localField and ForeignField
    //after nito, need mo gamitin ang populate() in order gumana
    foreignField: "tour", //field sa ReviewModel
    localField: "_id" // ito yung field ng currentModel(tourModel)
})



//Creating Document Middleware, document MW trigger in save() and create() mongoose method
// this, point to the current process document in the pre hook
TourSchema.pre("save", function (next) {
    this.slug = slugify(this.name, {lower: true})
    next()
})

// Example how to embed other document(user) to the tour
// the pre hook only trigger in creating docs not in updating
  // TourSchema.pre("save", async function(next) {
  //     this.guides = await Promise.all(this.guides.map(async (userId) => {
  //         return await userModel.findById(userId)
  //     }))
      
  //     console.log("dito bobo",this.guides)

  //     next()
  // })

   

// doc is the finish process document
TourSchema.post("save", function(doc,next) {
    //  console.log(doc)
     next()
})




//Creating Query Middle, this hook, execute before/after an query
// using regular expresion the ^ mean this will work in any query that start with "find"
//like findOne, findById
//this -> refer to the query
TourSchema.pre(/^find/, function (next){
    // this query will run first before the actual querys
    this.find({ secretTour : { $ne : true}})
    next()
})

//child refercing pero hindi persist sa db kasi using populate
TourSchema.pre(/^find/, function(next) {
   this.populate({
    path: "guides",
    select: "-__v"
   })

   next()
})




// Creating Aggregation Middleware, trigger when something perform aggregation 
// this, point to the current processs aggregation object
// dito sa middleware nato, nagadd tayo ng another stage dun sa pipeline 
// na kung saan reniremove yung mag secretTour set to true,
// TourSchema.pre("aggregate", function(next) {
//   this.pipeline().unshift({
//       $match : {
//           secretTour : { $ne : true}
//       }
//   })

//   console.log(this.pipeline())
//   next()
// }) 
 


// yung model parang ito ay interface sa db mo
const TourModel = mongoose.model("Tour", TourSchema)

module.exports = TourModel