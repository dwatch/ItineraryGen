import ItineraryDAO from "./fnsDAO.js";
import bcrypt from "bcrypt";

export default class LoginController {
  static async SignUp(req, res) {
      const name = req.body.name
      const username = req.body.username
      const password = await bcrypt.hash(req.body.password, 8)
      const added = await ItineraryDAO.signUp(name, username, password)
      const newUser = added.acknowledged ? {
        auth: true,
        name: name,
        username: username,
        lists: {},
        specList: "",
        itin_dets: null
      } : {
        auth: false,
        name: "",
        username: "",
        lists: {},
        specList: "",
        itin_dets: null
      }
      if (added.acknowledged) {
        req.session.user_id = added.insertedId
        req.session.user = newUser.username
        req.session.lists = newUser.lists
        res.json({
          message: 'You have sucessfully signed up',
          auth: true,
          user: newUser
        })
      } else {
        res.json({
          message: 'Unable to create account',
          auth: false,
          user: newUser
        })
      }
  }

  static async SignIn(req, res) {
    console.log("Sign In - server")
    const username = req.body.username
    const password = req.body.password
    let result = {message: "Username or Password Incorrect", auth: false}
    if (!username || !password) {
      result.message = "Both Username and Password Required"
    } else {
      const validUser = await ItineraryDAO.signIn(username)
      if (validUser) {
        const passMatch = await bcrypt.compare(password, validUser.password)
        if (passMatch) {
          req.session.user_id = validUser._id
          req.session.name = validUser.name
          req.session.username = validUser.username
          req.session.lists = validUser.lists
          req.session.specList = ""
          req.session.itin_dets = null
          result.message = "You have successfully logged in"
          result.auth = true
          result.user = {
            auth: true,
            name: validUser.name,
            username: validUser.username,
            lists: validUser.lists,
            specList: "",
            itin_dets: null
          }
        }
      }
    }
    console.log(`Signing in user: ${req.session.username}`)
    return res.json(result)
  }

  static async FindUser(req, res) {
    const username = req.body.username
    console.log(`Finding user: ${username}`)
    const validUser = await ItineraryDAO.signIn(username)
    if (validUser) {
      return res.json({message: "Found user", found: true})
    }
    return res.json({message: "Didn't find said username", found: false})
  }

  static Verified(req, res) {
    console.log("Verifying logged-in status")
    let result = {message: "You are not signed in", auth: false}
    if (req.session.user_id) {
      result.message = "You are signed in"
      result.auth = true
      result.user = {auth: true,
                      name: req.session.name,
                      username:req.session.username,
                      lists: req.session.lists,
                      specList: req.session.specList,
                      itin_dets: req.session.itin_dets
                    }
    }
    return res.json(result)
  }

  static Logout(req, res) {
    console.log("Logging Out")
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          res.status(400).send("Unable to log out")
        } else {
          res.send("Logged Out Successfully")
        }
      });
    } else {
      res.end()
    }
  }
}