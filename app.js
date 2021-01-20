const express = require("express")
const app = express()
const mongoose = require("mongoose")
const authRoutes = require("./routes/auth")
const passport = require("passport")
const Strategy = require("passport-twitter").Strategy
const session = require("express-session")
const bodyParser = require("body-parser")
require("dotenv/config")
const User= require("./models/user")
const Twit= require("twit")
const twitterWebhooks = require("twitter-webhooks")
const { json } = require("body-parser")
const socket_io= require("socket.io")
var io= socket_io()
const changeStream= User.watch()
changeStream.on('change', (change) => {
  console.log(change) 
  io.emit('changeData', change)
}) 

io.on('connection', function () {
  console.log('connected')
})

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

mongoose.connect(
  "mongodb+srv://user1:user1@cluster0.tjwcz.mongodb.net/Project0?retryWrites=true&w=majority",
  { useNewUrlParser: true },
  () => {
    console.log("connected to db")
  }
);

const T= new Twit({
  consumer_key: process.env.apikey,
  consumer_secret: process.env.apisecret,
  access_token: process.env.accesstoken,
  access_token_secret: process.env.accesstokensecret,
  
})
passport.use(
  new Strategy(
    {
      consumerKey: process.env.apikey,
      consumerSecret: process.env.apisecret,
      callbackURL: "https://serene-crag-19557.herokuapp.com/logged",
    },
    (token, tokenSecret, profile, cb) => {
      profile.access_token = token
      profile.access_token_secret = tokenSecret
      return cb(null, profile)
      //   })
    }
  )
)
passport.serializeUser((user, cb) => {
  cb(null, user)
})
passport.deserializeUser((obj, cb) => {
  cb(null, obj)
})
app.use(session({ secret: "whatever", resave: true, saveUninitialized: true }))
app.use(passport.initialize())
app.use(passport.session())
app.get(
  "/logged",
  passport.authenticate("twitter", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication, redirect home.
    // const obj= JSON.parse(Object.values(req.sessionStore.sessions)[0])  
    console.log("successful")
    // const access=Object.values(Object.values(obj)[1])
    const user= req.user
    console.log('req acess tokens: ', req.user.access_token, req.user.access_token_secret)
    // console.log(user)
    User.exists({username:user.username},  (err, result)=>{
      if (!result){
        var intweets=[]
        T.get("/statuses/mentions_timeline", {id: user.id}, (err, tweets)=>{
            if (!err){
             for (let i = 0; i < tweets.length; i++) {
              intweets.push(
                {
                  created_at: tweets[i].created_at,
                  text: tweets[i].text,
                  user: {
                    id: tweets[i].user.id,
                    id_str: tweets[i].user.id_str,
                    name: tweets[i].user.name,
                    screen_name: tweets[i].user.screen_name,
                    // profile_background_image_url: tweets[i].user.profile_background_image_url,
                    // profile_image_url: tweets[i].user.profile_image_url,
                  },
                  retweet_count: tweets[i].retweet_count,
                  favorite_count: tweets[i].favorite_count,
                }
              )
              
            }
            console.log("tweets: ",tweets)
            const newuser= new User({
              username: user.username,
              name: user.displayName,
              tweets:intweets
            })
            newuser.save()
            .then(data=>{
              console.log(data, "blank")
                res.json(data)
              })
            .catch(err=>{
              res.json(err)
              })
          }
          else {
            console.log(err)
          }
      })
    }else{
      User.find({username: user.username}, {_id:0, tweets:1, username:1}, (err, response)=>{
        console.log(response)
        res.json(response)
      })
    }
      console.log(result)
    })
    

  }
)

app.get('/', (req, res) => {
  T.post(":prac/webhooks", {url:"https://serene-crag-19557.herokuapp.com/webhook/listen"}, (a, b)=>{
      console.log("webhooks", a, b)
    })
  res.send('Hey There!! I am here, Go to /login to proceed');
})

app.post('/webhook/listen', (req, res) => {
  console.log(req)
})

app.get("/login", passport.authenticate("twitter"))
// app.use("/login", authRoutes)



const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Express server listening on port', port)
});