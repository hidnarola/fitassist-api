//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var TimeSchema = new Schema({
  monday: { type: Number, default: 0 },
  tuesday: { type: Number, default: 0 },
  wednesday: { type: Number, default: 0 },
  thursday: { type: Number, default: 0 },
  friday: { type: Number, default: 0 },
  saturday: { type: Number, default: 0 },
  sunday: { type: Number, default: 0 }
});

var ExercisePreferenceSchema = new Schema(
  {
    userId: {
      type: String,
      ref: "users",
      field: "authUserId",
      required: true,
      unique: true
    },
    workoutIntensity: { type: Number, default: 0 },
    exerciseExperience: { type: Number, default: 0 },
    excludeExercise: [
      { type: mongoose.Schema.Types.ObjectId, ref: "exercise", default: null }
    ],
    excludeExerciseType: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "exercise_types",
        default: null
      }
    ],
    existingInjuries: [
      { type: mongoose.Schema.Types.ObjectId, ref: "bodyparts", default: null }
    ],
    workoutscheduletype: { type: Number, default: 1, required: true },
    timeSchedule: TimeSchema,
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

// Compile model from schema
var Exercise_preference = mongoose.model(
  "exercise_preference",
  ExercisePreferenceSchema,
  "exercise_preference"
);

module.exports = Exercise_preference;
