//jshint esversion:6
require('dotenv').config()
const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require('./database/connection')
const session = require('express-session')
const passport = require("passport")


const User = require('./models/User')
const GoogleStrategy = require('./models/GoogleStrategy')
const app = express();

app.use(express.static("public"))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({
  extended: true
}))

// Connect to mongoDB.
mongoose.connect()

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

passport.use(User.createStrategy())

passport.serializeUser(function (user, done) {
  done(null, user.id)
})

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user)
  })
})

passport.use(GoogleStrategy)

app.get("/", function (req, res) {
  res.render("home");
})

/*************************** Google Authentication ***************************/
app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
)

app.get("/auth/google/secrets",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect("/secrets")
  })

/*************************** Local Authentication ***************************/
app.post("/login", function (req, res) {

  const user = new User({
    username: req.body.username,
    password: req.body.password
  })

  req.login(user, function (err) {
    if (err) {
      console.log(err)
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      })
    }
  })
})

app.get("/login", function (req, res) {
  res.render("login")
})

app.get("/register", function (req, res) {
  res.render("register")
})

app.get("/secrets", function (req, res) {
  // Check user is authenticated/logged in.
  if (req.isAuthenticated()) {
    User.find({ "secret": { $ne: null } }, function (err, foundUsers) {
      if (err) {
        console.log(err)
      } else {
        if (foundUsers) {
          res.render("secrets", { usersWithSecrets: foundUsers });
        }
      }
    })
  } else {
    // Not authenticated.  Redirect to login page
    res.redirect('/login')
  }
})

app.get("/submit", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("submit")
  } else {
    res.redirect("/login")
  }
})

app.post("/submit", function (req, res) {
  const submittedSecret = req.body.secret

  // Once  user is authenticated, their session is saved, their user details are saved to req.user.
  // req.user.id is the id of user in database.
  // console.log(req.user.id)

  // Get user by their id.
  User.findById(req.user.id, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.secret = submittedSecret
        foundUser.save(function () {
          res.redirect("/secrets")
        });
      }
    }
  });
});

app.get("/logout", function (req, res) {
  req.logout()
  res.redirect("/")
});

app.post("/register", function (req, res) {

  User.register({ username: req.body.username }, req.body.password, function (err, user) {
    if (err) {
      console.log(err)
      res.redirect("/register")
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets")
      })
    }
  })

})

app.listen(3000, function () {
  console.log("Server started on port 3000.");
})
