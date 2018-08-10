//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var UserPrimaryGoalsSchema = new Schema({
  userId: {
    type: String,
    ref: "users",
    field: "authUserId",
    required: true
  },
  start: {
    type: Number,
    default: 0,
    required: true
  },
  goal: {
    type: String,
    enum: [
      "gain_muscle",
      "improve_mobility",
      "lose_fat",
      "gain_strength",
      "gain_power",
      "increase_endurance"
    ],
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
var UserPrimaryGoals = mongoose.model(
  "user_primary_goals",
  UserPrimaryGoalsSchema,
  "user_primary_goals"
);

module.exports = UserPrimaryGoals;