//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var FollowSchema = new Schema({
  followerId: {
    type: String,
    ref: "users",
    field: "authUserId",
    required: true
  },
  followingId: {
    type: String,
    ref: "users",
    field: "authUserId",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false
});

// Compile model from schema
var Follows = mongoose.model("follows", FollowSchema, "follows");

module.exports = Follows;