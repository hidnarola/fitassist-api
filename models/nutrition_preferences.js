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
  end: { type: Number, default: null }
});

var NutritionPreferenceSchema = new Schema(
  {
    userId: { type: String, ref: "users", field: "authUserId", required: true },
    dietRestrictionLabels: [{ type: mongoose.Schema.Types.ObjectId, ref: "nutritional_labels" }],
    maxRecipieTime: [maxRecipieTimeSchema],
    nutritionTargets: [nutritionTargetsSchema],
    healthRestrictionLabels: [{ type: mongoose.Schema.Types.ObjectId, ref: "nutritional_labels" }],
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
