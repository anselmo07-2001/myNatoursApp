const mongoose = require("mongoose")
const crypto = require("crypto")
const validator = require("validator")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name field is required"]
    },
    email: {
        type: String,
        required: [true, "Email field is required"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide valid email"]
    },
    photo: {
        type: String,
        default: "default.jpg"
    },
    role: {
        type: String,
        enums: ["user","admin","lead-guide","guide"],
        default: "user"
    },
    password: {
        type: String,
        required: [true, "Password field is required"],
        minlength: 8,
        select:false
    },
    passwordConfirm: {
        type: String,
        required: [true, "PasswordConfirm field is required"],
        // validator trigger only in save() or create()
        validate: {
            validator: function(value) {
                return this.password === value
            },
            message: "Password is not match"
        }
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    changedPasswordAt: Date,
    passwordResetToken: String,
    passwordResetExpire: Date
})

// hash the password before storing to db
 userSchema.pre("save", async function(next) {
    // only hash the pw if the password is modified or created
     if (!this.isModified("password")) return next()

     const hashPassword = await bcrypt.hash(this.password, 8)
     this.password = hashPassword
     this.passwordConfirm = undefined

     next()
})


userSchema.pre("save", function(next) {
     // if the pw is not modified and its created return next
     if (!this.isModified("password") || this.isNew) return next()

     //subtract by one because dapat mauna magawa yung token after maiset yung changedPassword
     this.changedPasswordAt = Date.now() - 1000 
     next()
})


//hide all the users that account active is set to false
userSchema.pre(/^find/, function(next) {
    this.find({active: { $ne : false}})
    next()
})


userSchema.methods.isPasswordCorrect = async (candidatePassword, userPassword) => {
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.isPasswordChangedAfterTokenIssued = function (jwttimestamp) {
    if (this.changedPasswordAt) {
       const changedPasswordAtTimestamp = parseInt(this.changedPasswordAt.getTime() / 1000, 10)
       return jwttimestamp < changedPasswordAtTimestamp
    }

    // false means password didnt change
    return false
}


userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString("hex")
    console.log("token ->", resetToken)

    //hash the resetToken
    const hashResetToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    this.passwordResetToken = hashResetToken 
    this.passwordResetExpire = Date.now() + 10 * 60 * 1000

    return resetToken
}


const userModel = mongoose.model("User", userSchema)

module.exports = userModel