//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var FlagsSchema = new Schema({
  userId: {
    type: String,
    ref: "users",
    field: "authUserId",
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user_timeline",
    required: true
  },
  type: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
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
var Flags = mongoose.model("flags", FlagsSchema, "flags");

module.exports = Flags;