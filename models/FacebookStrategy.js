// Facebook Strategy

const FacebookStrategy = require('passport-facebook').Strategy
const User = require('./User')

const Strategy = new FacebookStrategy(
    {
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/secrets",
    profileFields: ['id', 'email', 'first_name', 'last_name']
  },

  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id, email: profile.emails[0].value }, function (err, user) {
      return cb(err, user)
    })
})

module.exports = Strategy
