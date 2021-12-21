import express from "express"
import cors from "cors"
import session from "express-session"
import router from "./express_router.js"
import path from "path"

const oneDay = 1000 * 60 * 60 * 24
const app = express()
const __dirname = path.resolve();

//Setting up an Express Session on top of the Server
app.use(session({
  secret: "dkxElc72!sFcE5dkeiLDKedI5827dk3Iu5lJJup8d7Iu1$23%",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: oneDay, secure: false }
}))
app.use(express.urlencoded({ extended: true }))

//Rest
app.use(cors())
app.use(express.json())

app.use("/", router)
app.use(express.static(path.join(__dirname, "client", "build")))
//app.use( "*", (req, res) => res.status(404).json({ error: "Not Found"}) )
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

export default app