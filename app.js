const express = require("express");
const app = express();
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const passport = require("passport");
const Strategy = require("passport-twitter").Strategy;
const session = require("express-session");
const bodyParser = require("body-parser");
const User= require("./models/user");
const Twit= require("twit");
const twitter= require("twitter");
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
mongoose.connect(
  "mongodb+srv://user1:user1@cluster0.tjwcz.mongodb.net/Project0?retryWrites=true&w=majority",
  { useNewUrlParser: true },
  () => {
    console.log("connected to db");
  }
);
passport.use(
  new Strategy(
    {
      consumerKey: "JAABlOt9wzw9dyr8SASkPjRrj",
      consumerSecret: "ki0m1aFKtdYisdalDQUOHnfOS0EI5XC1Iez1xbhx0Htox2NwrI",
      callbackURL: "http://localhost:3000",
    },
    (token, tokenSecret, profile, cb) => {
      //   User.findOrCreate({ twitterId: profile.id }, (err, user) => {
        console.log(token, profile);
        const T= new twitter({
          consumer_key: "JAABlOt9wzw9dyr8SASkPjRrj",
          consumer_secret: "ki0m1aFKtdYisdalDQUOHnfOS0EI5XC1Iez1xbhx0Htox2NwrI",
          access_token: token,
          access_token_secret: tokenSecret 
        })
        T.get("/statuses/mentions_timeline", {id: profile.id}, (err, tweets, res)=>{
          if (!err)
            {console.log(tweets)}
            else {
              console.log(err)
            }
        })
      return cb(null, profile,token);

      

      //   });
    }
  )
);
passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});
app.use(session({ secret: "whatever", resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.get(
  "/",
  passport.authenticate("twitter", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication, redirect home.
    const obj= JSON.parse(Object.values(req.sessionStore.sessions)[0])  
    console.log("successful");
    const access=Object.values(Object.values(obj)[1])
    const user= req.user;
    // console.log(req)
    // const T= new twitter({
    //   consumer_key: "JAABlOt9wzw9dyr8SASkPjRrj",
    //   consumer_secret: "ki0m1aFKtdYisdalDQUOHnfOS0EI5XC1Iez1xbhx0Htox2NwrI",
    //   access_token: access[0],
    //   access_token_secret: access[1]
    // })
    // console.log(user);
    User.exists({username:user.username}, (err, result)=>{
      if (!result){
        const newuser= new User({
          username: user.username,
          name: user.displayName
        });
        newuser.save()
        .then(data=>{
          // console.log(data, "blank");
            res.json(data);
          })
        .catch(err=>{
          res.json(err);
          });
      }
      console.log(result)
    })
    // T.get("/statuses/mentions_timeline", {id: user.id}, (err, tweets, res)=>{
    //   if (!err)
    //     {console.log(tweets)}
    //     else {
    //       console.log(err)
    //     }
    // })
    // console.log(access);
    res.send(access);
  }
);

app.post("/", (req, res)=>{
  console.log(req.body);
  const newuser= new User({
    uid: req.body.uid,
    name: req.body.name
  });
  console.log(newuser);
  newuser.save()
  .then(data=>{
    console.log(data, "blank");
      res.json(data);
    })
  .catch(err=>{
    res.json(err);
    });
})
app.get("/login", passport.authenticate("twitter"));
// app.use("/login", authRoutes);



app.listen(3000);
