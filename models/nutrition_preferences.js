//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var maxRecipieTimeSchema = new Schema({
  dayDrive: {
    type: String,
    enum: ["breakfast", "lunch", "dinner", "Snacks"],
    required: true
  },
  time: { type: Number, default: null }
});

var nutritionTargetsSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  start: { type: Number, default: null },
  end: { type: Number, default: null }
});
var NutritionPreferenceSchema = new Schema(
  {
    userId: { type: String, ref: "users", field: "authUserId", required: true },

    dietaryRestrictedRecipieTypes: [
      {
        type: String,
        enum: [
          "vegetarian",
          "vegan",
          "dairy-free",
          "kosher",
          "islam",
          "coeliac",
          "paleo",
          "pescaterian"
        ],
        required: true
      }
    ],
    recipieDifficulty: [
      {
        type: String,
        enum: ["easy", "medium", "hard"],
        required: true
      }
    ],
    maxRecipieTime: [maxRecipieTimeSchema],
    nutritionTargets: [nutritionTargetsSchema],
    excludeIngredients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ingredients",
        default: null
      }
    ],

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
