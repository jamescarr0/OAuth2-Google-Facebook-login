require('dotenv').config()
const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require('./database/connection')
const session = require('express-session')
const passport = require("passport")

const User = require('./models/User')
const GoogleStrategy = require('./models/GoogleStrategy')
const FacebookStrategy = require('./models/FacebookStrategy')

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

// Save user.id to session.
passport.serializeUser(function (user, done) {
  done(null, user.id)
})

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user)
  })
})

// Require and use strategy models.
passport.use(GoogleStrategy)
passport.use(FacebookStrategy)

app.get("/", function (req, res) {
  res.render("home");
})

/*************************** Google Authentication ***************************/
app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile", "email"] })
)

app.get("/auth/google/secrets",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect to secrets page.
    res.redirect("/secrets")
  })

/*************************** Facebook Authentication ***************************/

app.get('/auth/facebook',
  passport.authenticate('facebook'))

app.get('/auth/facebook/secrets',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function (req, res) {
    // Successful authentication, redirect secrets page.
    res.redirect('/secrets')
  })

/*************************** Local Authentication - Login & Register ***************************/
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
        res.redirect("/secrets")
      })
    }
  })
})

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


/*************************** Routes ***************************/
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
          res.render("secrets", { users: foundUsers })
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
      console.log(err)
    } else {
      if (foundUser) {
        foundUser.secret.push(submittedSecret)
        foundUser.save(function () {
          res.redirect("/secrets")
        })
      }
    }
  })
})

app.get("/logout", function (req, res) {
  req.logout()
  res.redirect("/")
});

// Start server, set port or use 3000.
const port = process.env.PORT || 3000
app.listen(port, function () {
  console.log(`Server started on port ${port}.`)
})
