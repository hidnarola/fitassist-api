//Require Mongoose
var mongoose = require("mongoose");
var constants = require("../constant");

//Define a schema
var Schema = mongoose.Schema;

var UserWorkoutExercises = new Schema(
  {
    userWorkoutsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_workouts",
      required: true
    },
    type: { type: String, enum: constants.WORKOUTS_TYPE },
    exercise: { type: Object, default: {} },
    reps: { type: Number },
    sets: { type: Number },
    setsDetails: { type: Array },
    isCompleted: { type: Number, default: 0 },
    date: { type: Date },
    completedDate: { type: Date },
    sequence: { type: Number, default: 0 }
  },
  { versionKey: false }
);

// Compile model from schema
var UserWorkoutExercises = mongoose.model(
  "user_workout_exercises",
  UserWorkoutExercises,
  "user_workout_exercises"
);

module.exports = UserWorkoutExercises;
