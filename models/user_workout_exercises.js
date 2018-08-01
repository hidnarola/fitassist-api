//Require Mongoose
var mongoose = require("mongoose");
var constants = require("../constant");

//Define a schema
var Schema = mongoose.Schema;
var ExercisesSchema = new Schema(
  {
    exercises: { type: Object },
    sets: { type: Number },
    restTime: { type: Number },
    restTimeUnit: { type: String },
    baseRestTime: { type: Number },
    baseRestTimeUnit: { type: String },
    differentSets: { type: Number },
    setsDetails: { type: Array }
  },
  { versionKey: false }
);
var UserWorkoutExercises = new Schema(
  {
    userWorkoutsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_workouts",
      required: true
    },
    type: { type: String, enum: constants.WORKOUTS_TYPE },
    subType: { type: String, enum: constants.WORKOUTS_SUB_TYPE },
    isCompleted: { type: Number, default: 0 },
    sequence: { type: Number, default: 0 },
    exercises: [{ type: ExercisesSchema }],
    date: { type: Date },
    completedDate: { type: Date }
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
