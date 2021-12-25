import express from "express"
import LoginController from "./controllers/login.controller.js"
import ListController from "./controllers/list.controller.js"
import dotenv from "dotenv";
dotenv.config()

const router = express.Router()
const url_addon = process.env.PUBLIC_URL === "" ? "" : "/"+process.env.PUBLIC_URL
//Login Pages
router.route(url_addon+"/auth/signup").post(LoginController.SignUp)
router.route(url_addon+"/auth/signin").post(LoginController.SignIn)
router.route(url_addon+"/auth/findUser").post(LoginController.FindUser)
router.route(url_addon+"/auth/verified").get(LoginController.Verified)
router.route(url_addon+"/auth/logout").delete(LoginController.Logout)
//Editing Pages
router.route(url_addon+"/addList").put(ListController.AddList)
router.route(url_addon+"/delList").put(ListController.DelList)
router.route(url_addon+"/selectList").put(ListController.SelectList)
router.route(url_addon+"/addLoc").put(ListController.AddLoc)
router.route(url_addon+"/delLoc").put(ListController.DelLoc)
router.route(url_addon+"/editLoc").put(ListController.EditLoc)
//Distance Matrix Query
router.route(url_addon+"/distMatrix").post(ListController.DistMatrix)
//Itinerary
router.route(url_addon+"/updateItinParams").put(ListController.UpateItinParams)

export default router

