const multer = require("multer")
const sharp = require("sharp")

const UserModel = require("./../model/userModel")
const catchAsync = require("./../utils/catchAsync")
const AppError = require("./../utils/appError")
const handlerFactory = require("./handlerFactory")
const userModel = require("./../model/userModel")



// Configure the  multerStorage sa diskStorage and multerFilter
// const multerStorage = multer.diskStorage({
// 	destination: (req,file,cb) => {
// 		cb(null, "public/img/users")
// 	},
// 	filename: (req,file,cb) => {
// 		const extensionFileName = file.mimetype.split("/")[1]
// 		cb(null, `user-${req.user.id}-${Date.now()}.${extensionFileName}`)
// 	}
// })

// Configure the multerStorage sa memoryStorage
const multerStorage = multer.memoryStorage();

// filter only images 
const multerFilter = (req,file,cb) => {
	if (file.mimetype.startsWith("image")) {
		cb(null, true);
	}
	else {
		cb(new AppError("Not an image, Please upload only image", 400), false);
	}
}

const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter
})

exports.uploadUserPhoto = upload.single("photo") // fieldname yng arg

exports.resizeUserPhoto = catchAsync(async(req,res,next) => {
    if (!req.file) return next()
 
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

    await sharp(req.file.buffer)
        .resize(500,500)
        .toFormat("jpeg")
        .jpeg({quality: 90})
        .toFile(`public/img/users/${req.file.filename}`)

    next()
})

exports.getUsers = handlerFactory.getAll(userModel)
// exports.getUsers = catchAsync(async(req,res) => {
//     const users = await UserModel.find()

//     res.status(200).json({
//         results: users.length,
//         status: "success",
//         data: {
//             users
//         }
//     })
// })

const filterObject = (object, ...allowedField) => {
    const newObject = {}

    Object.keys(object).forEach(key => {
        if (allowedField.includes(key)) {
            newObject[key] = object[key]
        }
    })

    return newObject
}


//this route only update the user name and email
exports.updateMe = catchAsync(async (req,res,next) => {
	// console.log("req.file ->", req.file)
	// console.log("req.body ->", req.body)
	
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError("this route is not for password update. Please use /updatePassword", 400))
    }


    const userNewData = filterObject(req.body, "name", "email")
    if (req.file) userNewData.photo = req.file.filename

    const updatedUser = await UserModel.findByIdAndUpdate(req.user.id, userNewData, {
        new: true,
        runValidators: true,
    })
    

    res.status(200).json({
        status: "success",
        data: {
            updatedUser
        }
    })
})


// It wont delete the user but mark it as inactive account
exports.deleteMe = catchAsync(async(req,res,next) => {
    await UserModel.findByIdAndUpdate(req.user.id, {active: false})

    res.status(204).json({
        status: "success",
        data: {
            user: null
        }
    })
})

// exports.getUser = (req,res) => {
//     res.status(500).json({
//         status: "error",
//         message: "Route not yet defined"
//     })
// }

exports.getMe = async (req,res,next) => {
    req.params.id = req.user.id
    next()
}



exports.createUser = (req,res) => {
    res.status(500).json({
        status: "error",
        message: "Route not is defined. Instead use /signup"
    })
}

//dont use this handler in updating password!,
//it uses findByIdAndUpdate() this will not trigger the midleware
exports.updateUser = handlerFactory.updateOne(userModel)
exports.deleteUser = handlerFactory.deleteOne(userModel)
exports.getUser = handlerFactory.getOne(userModel)


// exports.updateUser = (req,res) => {
//     res.status(500).json({
//         status: "error",
//         message: "Route not yet defined"
//     })
// }