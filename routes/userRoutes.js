const express = require("express")

const userController = require("../controllers/userController")
const authController = require("./../controllers/authController")

// api/v1/users
const router = express.Router()


router.post("/signup", authController.signUp)
router.post("/login", authController.login)
router.get("/logout", authController.logout)
router.post("/forgotPassword", authController.forgotPassword)
router.patch("/resetPassword/:token", authController.resetPassword)

//All route after nito ay dadaan muna sila sa mw nato
router.use(authController.protect)

router.patch("/updatePassword",authController.updatePassword)
router.patch("/updateMe", userController.uploadUserPhoto, userController.resizeUserPhoto ,userController.updateMe)
router.delete("/deleteMe", userController.deleteMe)
router.get("/me", userController.getMe, userController.getUser)


router.use(authController.restrictTo("admin"))

router.route("/")
         .get(userController.getUsers)
         .post(userController.createUser)

router.route("/:id")
         .get(userController.getUser)
         .patch(userController.updateUser) // this route is for admin
         .delete(userController.deleteUser)

module.exports = router