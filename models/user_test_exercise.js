//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var UserTestExerciseSchema = new Schema(
  {
    userId: { type: String, ref: "users", field: "authUserId", required: true },
    test_exercise_id: { type: String, ref: "test_exercises", required: true },
    format: {
      type: String,
      enum: ["max_rep", "multiselect", "a_or_b", "text_field"],
      required: true
    },
    text_field: { type: String, default: null },
    multiselect: { type: Number, default: null },
    max_rep: { type: Object, default: null },
    a_or_b: { type: Number, default: null },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

// Compile model from schema
var UsersTestExercise = mongoose.model(
  "user_test_exercise",
  UserTestExerciseSchema,
  "user_test_exercise"
);

module.exports = UsersTestExercise;
