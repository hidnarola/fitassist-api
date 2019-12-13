//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var ProgramsRatingSchema = new Schema(
  {
    userId: {
      type: String,
      ref: "users",
      field: "authUserId",
      required: true
    },
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_nutrition_programs",
      required: true
    },
    rating: {
      type: Number,
      default: 0,
      required: true
    },
    comment: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "modifiedAt"
    },
    versionKey: false
  }
);

// Compile model from schema
var NutritionProgramsRating = mongoose.model(
  "user_nutrition_programs_rating",
  ProgramsRatingSchema,
  "user_nutrition_programs_rating"
);

module.exports = NutritionProgramsRating;
