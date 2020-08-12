const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

// Add findOrCreate method.  
// This method is high level pseudo code on passport documentation
const findOrCreate = require('mongoose-findorcreate');

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    facebookId: String,
    secret: [String],
  })
  
  userSchema.plugin(passportLocalMongoose);
  userSchema.plugin(findOrCreate);
  
module.exports = mongoose.model("User", userSchema);