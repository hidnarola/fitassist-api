//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var UserTestExerciseSchemaLogs = new Schema(
  {
    userId: { type: String, ref: "users", field: "authUserId", required: true },
    test_exercise_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "test_exercises",
      required: true
    },
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
var UsersTestExerciseLogs = mongoose.model(
  "user_test_exercise_logs",
  UserTestExerciseSchemaLogs,
  "user_test_exercise_logs"
);

module.exports = UsersTestExerciseLogs;
