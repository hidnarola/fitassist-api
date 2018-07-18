//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var exerciseMeasurementsSchema = new Schema(
  {
    workoutType: { type: String },
    time: { type: Boolean },
    disatance: { type: Boolean },
    reps: { type: Boolean },
    timeUnit: [
      {
        type: String,
        enum: ["second", "minutes", "hours"]
      }
    ],
    disatanceUnit: [
      {
        type: String,
        enum: ["meter", "feet", "km", "mile"]
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
