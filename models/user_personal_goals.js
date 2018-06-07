//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var UserPersonalGoalsSchema = new Schema(
  {
    userId: { type: String, ref: "users", field: "authUserId", required: true },
    start: {
      type: Number,
      default: 0,
      required: true
    },
    target: {
      type: Number,
      default: 0,
      required: true
    },
    unit: {
      type: String,
      required: true
    },
    isCompleted: {
      type: Number,
      default: 0
    },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

// Compile model from schema
var UserPersonalGoals = mongoose.model(
  "user_personal_goals",
  UserPersonalGoalsSchema,
  "user_personal_goals"
);

module.exports = UserPersonalGoals;
