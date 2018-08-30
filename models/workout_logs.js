//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var WorkoutLogsSchema = new Schema({
  userId: {
    type: String,
    ref: "users",
    field: "authUserId",
    required: true
  },
  setsDetailId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  //exerciseId of exercise collection
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "exercise"
  },
  //workoutId of user_workout_exercises collection
  workoutId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user_workout_exercises"
  },
  isCompleted: {
    type: Number,
    default: 0
  },
  time: {
    type: Number,
    default: 0
  },
  distance: {
    type: Number,
    default: 0
  },
  effort: {
    type: Number,
    default: 0
  },
  weight: {
    type: Number,
    default: 0
  },
  restTime: {
    type: Number,
    default: 0
  },
  oneRm: {
    type: Number,
    default: 0
  },
  speed: {
    type: Number,
    default: 0
  },
  repTime: {
    type: Number,
    default: 0
  },
  setTime: {
    type: Number,
    default: 0
  },
  reps: {
    type: Number,
    default: 0
  },
  sets: {
    type: Number,
    default: 0
  },
  name: {
    type: String,
    default: null
  },
  type: {
    type: String,
    default: null
  },
  subType: {
    type: String,
    default: null
  },
  logDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false
});

// Compile model from schema
var WorkoutLogs = mongoose.model(
  "workout_logs",
  WorkoutLogsSchema,
  "workout_logs"
);

module.exports = WorkoutLogs;