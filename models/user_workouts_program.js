//Require Mongoose
var mongoose = require("mongoose");
var constants = require("../constant");

//Define a schema
var Schema = mongoose.Schema;

var UserWorkoutProgramSchema = new Schema(
  {
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_programs",
      required: true
    },
    title: { type: String },
    description: { type: String },
    type: { type: String, enum: ["exercise", "restday"], default: "exercise" },
    userId: { type: String, ref: "users", field: "authUserId" },
    day: { type: Number },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

// Compile model from schema
var UserWorkoutProgram = mongoose.model(
  "user_workouts_program",
  UserWorkoutProgramSchema,
  "user_workouts_program"
);

module.exports = UserWorkoutProgram;
