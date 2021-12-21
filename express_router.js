import express from "express"
import LoginController from "./controllers/login.controller.js"
import ListController from "./controllers/list.controller.js"

const router = express.Router()

//Login Pages
router.route("/auth/signup").post(LoginController.SignUp)
router.route("/auth/signin").post(LoginController.SignIn)
router.route("/auth/findUser").post(LoginController.FindUser)
router.route("/auth/verified").get(LoginController.Verified)
router.route("/auth/logout").delete(LoginController.Logout)
//Editing Pages
router.route("/addList").put(ListController.AddList)
router.route("/delList").put(ListController.DelList)
router.route("/selectList").put(ListController.SelectList)
router.route("/addLoc").put(ListController.AddLoc)
router.route("/delLoc").put(ListController.DelLoc)
router.route("/editLoc").put(ListController.EditLoc)
//Distance Matrix Query
router.route("/distMatrix").post(ListController.DistMatrix)
//Itinerary
router.route("/updateItinParams").put(ListController.UpateItinParams)

export default router

