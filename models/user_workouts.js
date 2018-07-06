//Require Mongoose
var mongoose = require("mongoose");
var constants = require("../constant");

//Define a schema
var Schema = mongoose.Schema;

var UserWorkoutSchema = new Schema(
  {
    title: { type: String },
    description: { type: String },
    isCompleted: { type: Number, default: 0 },
    type: { type: String, enum: ["exercise", "restday"], default: "exercise" },
    userId: { type: String, ref: "users", field: "authUserId" },
    date: { type: Date },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

// Compile model from schema
var UserWorkout = mongoose.model(
  "user_workouts",
  UserWorkoutSchema,
  "user_workouts"
);

module.exports = UserWorkout;
