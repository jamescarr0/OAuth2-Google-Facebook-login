const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./User')

const Strategy = new GoogleStrategy(
    {
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
    function (accessToken, refreshToken, profile, cb) {
        User.findOrCreate({ googleId: profile.id, email: profile.emails[0].value }, function (err, user) {
            return cb(err, user)
        })
    }
)

module.exports = Strategy
