//Require Mongoose
var mongoose = require("mongoose");
var constants = require("../constant");

//Define a schema
var Schema = mongoose.Schema;

var ScheduleSchema = new Schema(
  {
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "exercise",
      required: true
    },
    reps: { type: Number, required: true },
    sets: { type: Number, required: true },
    restTime: { type: Number, required: true },
    oneSetTimer: { type: Number, required: true },
    weight: { type: Number, required: true },
    distance: { type: Number, required: true },
    isCompleted: { type: Number, required: true },
    createdBy: { type: Number, required: true },
    createdDate: { type: Number, required: true },
    completedDate: { type: Number, required: true },
    isRestDay: { type: Number, required: true },
    title: { type: Number, required: true },
    description: { type: Number, required: true },
    day: { type: Number, required: true }
  },
  { versionKey: false }
);

var UserWorkoutSchema = new Schema(
  {
    userId: { type: String, ref: "users", field: "authUserId", required: true },
    name: { type: String, required: true },
    type: { type: String, enum: constants.WORKOUTS_TYPE, default: true },
    days: { type: String, default: true },
    difficulty: { type: Number, default: 0, required: true },
    schedule: [{ type: ScheduleSchema, required: false }],
    date: { type: Date, required: true },
    isCompleted: { type: Number, required: true },
    status: { type: Number, default: 1 },
    isDeleted: { type: Number, default: 0 },
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
