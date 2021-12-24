import express from "express"
import session from "express-session"
import MongoStore from 'connect-mongo'
import router from "./express_router.js"
import path from "path"

//const oneDay = 1000 * 60 * 60 * 24
const oneDay = 60 * 60 * 24
const app = express()
const __dirname = path.resolve();

app.use(express.json())

//Setting up an Express Session on top of the Server
app.use(session({
  secret: process.env.SECRET,
  saveUninitialized: true,
  resave: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: oneDay
  })
}));
app.use(express.urlencoded({ extended: true }))

//Rest
app.use("/", router)
app.use(express.static(path.join(__dirname, "client", "build")))
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

export default app