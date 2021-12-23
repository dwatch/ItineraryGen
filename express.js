import express from "express"
import cors from "cors"
import session from "express-session"
import MongoStore from 'connect-mongo'
import router from "./express_router.js"
import path from "path"

//const oneDay = 1000 * 60 * 60 * 24
const oneDay = 60 * 60 * 24
const app = express()
const __dirname = path.resolve();

app.use(cors())
app.use(express.json())

//Setting up an Express Session on top of the Server
app.use(session({
  secret: 'dkxElc72!sFcE5dkeiLDKedI5827dk3Iu5lJJup8d7Iu1$23%',
  saveUninitialized: true,
  resave: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: oneDay
  })
}));
/*
app.enable('trust proxy');
app.use(session({
  secret: "dkxElc72!sFcE5dkeiLDKedI5827dk3Iu5lJJup8d7Iu1$23%",
  resave: true,
  saveUninitialized: true,
  //cookie: { maxAge: oneDay, secure: false }
  cookie: { httpOnly: true, secure: true, maxAge: oneDay, sameSite: 'none' }
}))
*/
app.use(express.urlencoded({ extended: true }))

//Rest
app.use("/", router)
app.use(express.static(path.join(__dirname, "client", "build")))
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

app.use(function(req,res,next){
  res.locals.user = req.user || null;
  if(req.session.views){
    req.session.views += 1
    req.session.save();
  }else{
    req.session.views = 1
    req.session.save();
  }
  console.log('req.session.views', req.session.views)
  next();
})

export default app