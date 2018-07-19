//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var exerciseMeasurementsSchema = new Schema(
  {
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    field1: [
      {
        type: String,
        enum: [
          "second",
          "minutes",
          "hours",
          "meter",
          "feet",
          "km",
          "mile",
          "reps"
        ],
        default: []
      }
    ],
    field2: [
      {
        type: String,
        enum: ["effort", "kmph", "mph", "lb", "kg", "one_rm"],
        default: []
      }
    ],
    field3: [
      {
        type: String,
        enum: ["rep_time", "set_time", "reps"],
        default: []
      }
    ],
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

// Compile model from schema
var ExerciseMeasurements = mongoose.model(
  "exercise_measurements",
  exerciseMeasurementsSchema,
  "exercise_measurements"
);

module.exports = ExerciseMeasurements;
