//Require Mongoose
var mongoose = require("mongoose");
var constants = require("../constant");

//Define a schema
var Schema = mongoose.Schema;

var UserWorkoutExercisesProgramSchema = new Schema(
  {
    userWorkoutsProgramId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_workouts_program",
      required: true
    },
    type: { type: String, enum: constants.WORKOUTS_TYPE },
    exercises: { type: Array }
  },
  { versionKey: false }
);

// Compile model from schema
var UserWorkoutExercisesProgram = mongoose.model(
  "user_workout_exercises_program",
  UserWorkoutExercisesProgramSchema,
  "user_workout_exercises_program"
);

module.exports = UserWorkoutExercisesProgram;
