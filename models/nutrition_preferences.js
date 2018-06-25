//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var maxRecipieTimeSchema = new Schema({
  dayDrive: {
    type: String,
    enum: ["breakfast", "lunch", "dinner", "snacks"],
    required: true
  },
  time: { type: Number, default: null }
});

var nutritionTargetsSchema = new Schema({
  start: { type: Number, default: null },
  end: { type: Number, default: null },
  nutritionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "nutritions",
    required: true
  }
});

var NutritionPreferenceSchema = new Schema(
  {
    userId: {
      type: String,
      ref: "users",
      field: "authUserId",
      required: true,
      unique: true
    },
    dietRestrictionLabels: [
      { type: mongoose.Schema.Types.ObjectId, ref: "nutritional_labels" }
    ],
    healthRestrictionLabels: [
      { type: mongoose.Schema.Types.ObjectId, ref: "nutritional_labels" }
    ],
    maxRecipeTime: [maxRecipieTimeSchema],
    nutritionTargets: [nutritionTargetsSchema],
    excludeIngredients: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

// Compile model from schema
var Nutrition_preference = mongoose.model(
  "nutrition_preferences",
  NutritionPreferenceSchema,
  "nutrition_preferences"
);

module.exports = Nutrition_preference;
