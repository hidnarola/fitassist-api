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
    restTime: { type: Number },
    oneSetTimer: { type: Number },
    weight: { type: Number },
    distance: { type: Number },
    isCompleted: { type: Number },
    completedDate: { type: Date },
    sequence: { type: Number }
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
