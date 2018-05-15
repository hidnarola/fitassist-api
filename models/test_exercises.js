//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var TestExerciesSchema = new Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["strength", "flexibility", "posture", "cardio"],
      required: true
    },
    subCategory: {
      type: String,
      enum: ["upper_body", "side", "lower_body", "cardio"],
      required: true
    },
    description: { type: String, default: null },
    featureImage: { type: String, default: null },
    instructions: { type: String, default: null },
    format: {
      type: String,
      enum: ["max_rep", "multiselect", "a_or_b"],
      required: true
    },
    max_rep: [],
    multiselect: [],
    a_or_b: [],
    status: { type: Number, default: 1 },
    isDeleted: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

// Compile model from schema
var TestExercies = mongoose.model(
  "test_exercises",
  TestExerciesSchema,
  "test_exercises"
);

module.exports = TestExercies;
