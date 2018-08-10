//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var BadgesAssignSchema = new Schema({
  userId: {
    type: String,
    ref: "users",
    field: "authUserId",
    required: true
  },
  badgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "badges",
    required: true
  },
  task: {
    type: String
  },
  category: {
    type: String
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
var BadgesAssign = mongoose.model(
  "badges_assign",
  BadgesAssignSchema,
  "badges_assign"
);

module.exports = BadgesAssign;