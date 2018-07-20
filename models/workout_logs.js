//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var WorkoutLogsSchema = new Schema(
  {
    userId: { type: String, ref: "users", field: "authUserId", required: true },
    workoutExerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_workout_exercises",
      required: true
    },
    isCompleted: { type: Number, default: 0 },
    time: { type: Number, default: 0 },
    distance: { type: Number, default: 0 },
    effort: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },
    repTime: { type: Number, default: 0 },
    setTime: { type: Number, default: 0 },
    reps: { type: Number, default: 0 },
    sets: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

// Compile model from schema
var WorkoutLogs = mongoose.model(
  "workout_logs",
  WorkoutLogsSchema,
  "workout_logs"
);

module.exports = WorkoutLogs;
