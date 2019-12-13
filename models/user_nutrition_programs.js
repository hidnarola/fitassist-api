//Require Mongoose
var mongoose = require("mongoose");
var constants = require("../constant");

//Define a schema
var Schema = mongoose.Schema;

var UserNutritionProgramsSchema = new Schema(
  {
    name: { type: String },
    description: { type: String },
    privacy: { type: Number, default: constants.PROGRAM_PRIVACY_PRIVATE },
    level: { type: String, default: constants.PROGRAM_LEVEL_OPTIONS[0] },
    tags: { type: Array, default: [] },
    categories: { type: Array, default: [] },
    userId: { type: String },
    type: { type: String, enum: ["admin", "user"] }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "modifiedAt"
    },
    versionKey: false
  }
);

var UserNutritionPrograms = mongoose.model(
  "user_nutrition_programs",
  UserNutritionProgramsSchema,
  "user_nutrition_programs"
);

module.exports = UserNutritionPrograms;
