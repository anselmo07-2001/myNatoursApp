const express = require("express")
const viewController = require("./../controllers/viewController")
const authController = require("./../controllers/authController")

const router = express.Router()

// router.use(authController.isLogin)

router.get("/", authController.isLogin, viewController.getOverview)
router.get("/tours/:slug", authController.isLogin,  viewController.getTour)
router.get("/login", authController.isLogin, viewController.getLoginForm)
router.get("/me", authController.protect ,viewController.getAccount)

router.post("/submit-user-data", authController.protect ,viewController.updateUserData)

module.exports = router