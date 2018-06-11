//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var UserSecondaryGoalsSchema = new Schema(
  {
    userId: { type: String, ref: "users", field: "authUserId", required: true },
    start: {
      type: Number,
      default: 0,
      required: true
    },
    unit: {
      type: String,
      required: true
    },
    goal: {
      type: String,
      enum: [
        "gain_muscle",
        "gain_flexibility",
        "lose_fat",
        "gain_strength",
        "gain_power",
        "increase_endurance"
      ],
      required: true
    },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

// Compile model from schema
var UserSecondaryGoals = mongoose.model(
  "user_secondary_goals",
  UserSecondaryGoalsSchema,
  "user_secondary_goals"
);

module.exports = UserSecondaryGoals;