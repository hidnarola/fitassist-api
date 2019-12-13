//Require Mongoose
var mongoose = require("mongoose");
var _ = require("underscore");
var constant = require("../constant");

//Define a schema
var Schema = mongoose.Schema;

var IngredientsIncludedSchema = new Schema({
  ingredient_id: { type: mongoose.Schema.Types.ObjectId, ref: "proximates" },
  serving_input: { type: Number },
  ingredient_unit: { type: String, default: "g" },
  count: { type: Number },

  totalKcl: { type: String },
  totalfat: { type: String },
  totalProtein: { type: String },
  totalCarbs: { type: String },
  totalSugar: { type: String },
  totalWater: { type: String },
  totalStarch: { type: String },
  totalCholesterol: { type: String }
});

var MealsSchema = new Schema(
  {
    userId: { type: String, ref: "users", field: "authUserId", required: true },
    ingredientsIncluded: [IngredientsIncludedSchema],
    description: { type: String },
    serves: { type: Number, default: 1 },
    serving_difficulty: { type: String, default: "easy" },
    notes: { type: String },
    title: { type: String },
    image: { type: String },
    meals_type: { type: String },
    meals_visibility: { type: String },
    instructions: { type: String },
    categories: {
      vegetarian: { type: Boolean, default: false },
      kosher: { type: Boolean, default: false },
      vegan: { type: Boolean, default: false },
      coelaic: { type: Boolean, default: false },
      paleo: { type: Boolean, default: false },
      keto: { type: Boolean, default: false }
    },
    cooking_time: {
      prep_time: { type: Number, default: 0 },
      prep_time_unit: { type: String, default: "second" },
      cook_time: { type: Number, default: 0 },
      cook_time_unit: { type: String, default: "second" }
    },
    day: { type: Number, required: true },
    programId: {
      type: Schema.Types.ObjectId,
      ref: "user_nutrition_programs",
      required: true
    }
  },
  {
    versionKey: false
  }
);

// Compile model from schema
var UserNutritionProgramsMeals = mongoose.model(
  "user_nutrition_programs_meals",
  MealsSchema,
  "user_nutrition_programs_meals"
);

module.exports = UserNutritionProgramsMeals;
