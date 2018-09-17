//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var FriendSchema = new Schema({
  userId: {
    type: String,
    ref: "users",
    field: "authUserId",
    required: true
  },
  friendId: {
    type: String,
    ref: "users",
    field: "authUserId",
    required: true
  },
  status: {
    type: Number,
    enum: [1, 2],
    required: true,
    default: 1
  },
  //1 for pending 2 for approved
  createdAt: {
    type: Date,
    default: Date.now
  },
  modifiedAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false
});

// Compile model from schema
var Friends = mongoose.model("friends", FriendSchema, "friends");

module.exports = Friends;