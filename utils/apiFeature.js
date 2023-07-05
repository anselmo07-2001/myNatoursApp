class APIFeatures {
    constructor(queryObject, queryString) {
        console.log(queryObject)
        this.queryObject = queryObject // Tour() -> ito yung model
        this.queryString = queryString // req.query
    }

    filter() {
        let query = {...this.queryString}
        const excludeQuery = ["sort", "page", "limit", "fields"]
        excludeQuery.forEach((value) => delete query[value]) //Why do we exclude them?
     
        //Advance filtering
        query = JSON.stringify(query)
        query = JSON.parse(query.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`))
        this.queryObject = this.queryObject.find(query) // magrereturn ng queryObj yung find()
        return this
    }


    sort() {
         if (this.queryString.sort) {
            //sorting multiple criteria, dapat ganito sort("price ratingsAverage")
            const sortOption = this.queryString.sort.split(",").join(" ")
            this.queryObject = this.queryObject.sort(sortOption)
        }else{
            this.queryObject = this.queryObject.sort("-createdAt")
        }

        return this
    }

    fieldLimiting() {
        if (this.queryString.fields) {
            console.log("true", this.queryString.fields)
            const fields = this.queryString.fields.split(",").join(" ")
            this.queryObject = this.queryObject.select(fields)
        }
        else {
            this.queryObject = this.queryObject.select("-__v")
        }
        

        return this
    }

    paginate() {
        const limit = this.queryString.limit * 1 || 100
        const page = this.queryString.page * 1|| 1
        const skip = ( page - 1) * limit

        this.queryObject = this.queryObject.skip(skip).limit(limit)
        return this
    }
}


module.exports = APIFeatures