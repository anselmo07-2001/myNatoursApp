const { promisify } = require("util")
const crypto = require("crypto")
const jwt = require("jsonwebtoken")
const userModel = require("./../model/userModel")
const catchAsync = require("./../utils/catchAsync")
const AppError = require("./../utils/appError")
const sendEmail = require("./../utils/email")
const Email = require("./../utils/email")


const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPTIME
    })
}


const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id)
    const cookieOption =  {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        // secure prop when true, the cookie will only send by the server only in a https
        // secure only works in prod
        // secure: true,     
        httpOnly: true //httpOnly when true, the cookie cant access or modified in the browser, also avoiding css
    }

    if (process.env.NODE_ENV === "production") {
        cookieOption.secure = true
    }

    res.cookie("jwt", token, cookieOption)

    //remove user password from the output
    user.password = undefined

    res.status(200).json({
        status: "success",
        user,
        data: {
            token
        }
    })
}

exports.signUp = catchAsync(async(req,res) => {
    const newUser = await userModel.create(req.body)

    const url = `${req.protocol}://${req.get("host")}/me`
    await new Email(newUser, url).sendWelcome()
    createSendToken(newUser, 200, res)
})


exports.login = catchAsync(async(req,res,next) => {
    const { email, password } = req.body

    //check if the email or password exist
    if (!email || !password) {
        return next(new AppError("Please Provide email and password"))
    }

    //check if the user is exist using the email and the password is correct
    const user = await userModel.findOne({ email }).select("+password")
    if (!user || !(await user.isPasswordCorrect(password, user.password))) {
        console.log("shittttttt")
        return next(new AppError("Incorrect Email or Password", 401))
    }

    createSendToken(user, 200, res)
})


//this is a middleware that will be used to protect authorize route
exports.protect = catchAsync(async(req,res,next) => {

    // Get the token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1] 
    }else if (req.cookies.jwt) {
        token = req.cookies.jwt
    }


    if (!token) {
        return next(new AppError("Unauthorize route, Please login", 401))
    }
    
 
    //Verifying token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    // Check if the user still exist
    const currentUser = await userModel.findById(decoded.id)
    if (!currentUser) {
        return next(new AppError("The user who belong to this token no longer exist", 401))
    }

    // Check if the user changed its password after the token was issued
    // kapag nagchange passwd si user, after na na created yung token, dapat yung token
    // nayun hindi na valid, kapag nagchange ng password, bago dapat token nya
    if(currentUser.isPasswordChangedAfterTokenIssued(decoded.iat)) {
        return next(new AppError("User recently changed password!, Please log in again",401))
    }

    //Grant Access to Protected Route
    req.user = currentUser
    // req.locals.user = currentUser
    next()
})

exports.logout = async(req,res,next) => {
    console.log(req.cookie)

    res.cookie("jwt", "logout", {
        maxAge: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })

    res.status(200).json({
        status: "success"
    })
}

// use in views to conditionally render element
exports.isLogin = async(req,res,next) => {

    if (req.cookies.jwt) {
        try {
            // verify
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)
            
            // Check if the user still exist
            const currentUser = await userModel.findById(decoded.id)
            if (!currentUser) {
                return next()
            }

            // Check if the user changed its password after the token was issued
            // kapag nagchange passwd si user, after na na created yung token, dapat yung token
            // nayun hindi na valid, kapag nagchange ng password, bago dapat token nya
            if (currentUser.isPasswordChangedAfterTokenIssued(decoded.iat)) {
                return next()
            }

            console.log("current User ->", currentUser)
            // storing the var into the req.locals, this will be accessible in the views(pug)
            res.locals.user = currentUser
            return next()
        }
        catch(err) {
            console.log(err)
            return next()
        }
    }

    return next()
}


exports.restrictTo = (...roles) => {
    return (req,res,next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError("You do not have to perform this action", 403))
        }

        next()
    }
}

exports.forgotPassword = catchAsync(async(req,res,next) => {
    //Step 1: get the email
    const user = await userModel.findOne({email: req.body.email})
    if (!user) {
        return next(new AppError("There is no user with the email", 404))
    }

    //Step 2: create a reset token instance method
    // gagamiting itong function nato for sending a reset token kay
    // user sa email nya, may resetTokenPassoword token nakasave sa DB, dapat match
    // yung reset token ni user at sa reset token sa DB, pag hindi match, hindi si user
    // yung nagchachange ng password
    const resetToken = user.createPasswordResetToken()
    await user.save({validateBeforeSave: false})


    // const message = `Forgot your password? Submit a PATCH request your new password and confirm password to: ${resetUrl} 
    // \n If you didn't forgot your password. Please ignore this email`

    //Step 4: send yung reset token sa email ni user
    try {
        // await sendEmail({
        //     email: user.email,
        //     subject: "Your password reset token (valid for 10 minutes)",
        //     message,
        // })

        //Step 3: Creating the resetPasswordUrl
        const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`
        await new Email(user, resetUrl).sendPasswordReset()
    
        res.status(200).json({
            status: "success",
            message: "The reset token is send through email"
        })
    }
    catch(err) {
        // if something goes wrong, set this properties to undefined
        user.passwordResetToken = undefined
        user.passwordResetExpire = undefined
        await user.save({validateBeforeSave: false})

        return next(new AppError("There is something wrong with the sending an email, Try again later", 500))
    }
})



exports.resetPassword = catchAsync (async (req,res,next) => {
    //S1: Get yung user based sa token
    const token = req.params.token
    const hashToken = crypto.createHash("sha256").update(token).digest("hex")
    console.log("hashing the reset token ->", hashToken)

    const user = await userModel.findOne({ 
        passwordResetToken : hashToken,
        // passwordResetExpire is equal sa currentTime + 10minutes advance
        // pag ito ay mababa na sa current time expired na yung token
        passwordResetExpire: { $gt: Date.now() }
    })

    if (!user) {
        return next(new AppError("Reset Token Already expired!",400))
    }

    //S2: If user exist update its password 
    // the pre hook will set the changePasswordAt value
    user.password = req.body.password,
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetExpire = undefined
    user.passwordResetToken = undefined
    await user.save()

    //S3: Login the user and send its JWT
    createSendToken(user, 200, res)
})


exports.updatePassword = catchAsync(async (req,res,next) => {
    //S1: Kunin si user sa collection
    const user = await userModel.findOne({_id: req.user._id}).select("+password")
    console.log(req.body.password)

    //S2: Check if the current password is correct
    const isPasswordCorrect = await user.isPasswordCorrect(req.body.currentPassword, user.password)
    
    //S3: If correct update yung password
    if (!isPasswordCorrect) return next(new AppError("Password is incorrect", 401))
    user.password = req.body.newPassword
    user.passwordConfirm = req.body.newPasswordConfirm
    await user.save()

    //S4: Send the user a jwt
    createSendToken(user, 200, res)
})