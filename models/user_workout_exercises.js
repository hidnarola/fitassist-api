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
    weightUnits: { type: String },
    distanceUnits: { type: String },
    baseWeightUnits: { type: String },
    baseDistanceUnits: { type: String },
    baseWeightValue: { type: Number },
    baseDistanceValue: { type: Number },
    isCompleted: { type: Number, default: 0 },
    date: { type: Date },
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
