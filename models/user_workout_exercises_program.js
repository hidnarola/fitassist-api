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
var UserWorkoutExercisesProgramSchema = new Schema(
  {
    userWorkoutsProgramId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_workouts_program",
      required: true
    },
    type: { type: String, enum: constants.WORKOUTS_TYPE },
    subType: { type: String, enum: constants.WORKOUTS_SUB_TYPE },
    exercises: [{ type: ExercisesSchema }],
    sequence: { type: Number, default: 0 }
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
