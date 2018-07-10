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
    exercise: { type: Object, default: {} },
    reps: { type: Number },
    sets: { type: Number },
    restTime: { type: Number },
    oneSetTimer: { type: Number },
    weight: { type: Number },
    distance: { type: Number },
    weightUnits: { type: String },
    distanceUnits: { type: String },
    baseWeightUnits: { type: String },
    baseDistanceUnits: { type: String },
    baseWeightValue: { type: Number },
    baseDistanceValue: { type: Number },
    isCompleted: { type: Number, default: 0 },
    sequence: { type: Number }
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
