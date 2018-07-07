//Require Mongoose
var mongoose = require("mongoose");
var constants = require("../constant");

//Define a schema
var Schema = mongoose.Schema;

var UserProgramsSchema = new Schema(
  {
    name: { type: String },
    description: { type: String },
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
