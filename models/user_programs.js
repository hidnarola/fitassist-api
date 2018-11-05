//Require Mongoose
var mongoose = require("mongoose");
var constants = require("../constant");

//Define a schema
var Schema = mongoose.Schema;

var UserProgramsSchema = new Schema(
  {
    name: { type: String },
    description: { type: String },
    privacy: { type: Number, default: constants.PROGRAM_PRIVACY_PRIVATE },
    level: { type: String, default: constants.PROGRAM_LEVEL_OPTIONS[0] },
    goal: { type: String, default: null },
    userId: { type: String },
    type: { type: String, enum: ["admin", "user"] },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

// Compile model from schema
var UserPrograms = mongoose.model(
  "user_programs",
  UserProgramsSchema,
  "user_programs"
);

module.exports = UserPrograms;
