//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var UsersNutritions = new Schema(
  {
    userId: {
      type: String,
      ref: "users",
      field: "authUserId",
      required: true,
      unique: true
    },
    calories_total: { type: Number, default: 0 },
    calories_average: { type: Number, default: 0 },
    calories_most: { type: Number, default: 0 },
    calories_least: { type: Number, default: 0 },
    calories_excess: { type: Number, default: 0 },
    saturated_total: { type: Number, default: 0 },
    saturated_average: { type: Number, default: 0 },
    saturated_most: { type: Number, default: 0 },
    saturated_least: { type: Number, default: 0 },
    saturated_excess: { type: Number, default: 0 },
    trans_total: { type: Number, default: 0 },
    trans_average: { type: Number, default: 0 },
    trans_most: { type: Number, default: 0 },
    trans_least: { type: Number, default: 0 },
    trans_excess: { type: Number, default: 0 },
    folate_total: { type: Number, default: 0 },
    folate_average: { type: Number, default: 0 },
    folate_most: { type: Number, default: 0 },
    folate_least: { type: Number, default: 0 },
    folate_excess: { type: Number, default: 0 },
    potassium_total: { type: Number, default: 0 },
    potassium_average: { type: Number, default: 0 },
    potassium_most: { type: Number, default: 0 },
    potassium_least: { type: Number, default: 0 },
    potassium_excess: { type: Number, default: 0 },
    magnesium_total: { type: Number, default: 0 },
    magnesium_average: { type: Number, default: 0 },
    magnesium_most: { type: Number, default: 0 },
    magnesium_least: { type: Number, default: 0 },
    magnesium_excess: { type: Number, default: 0 },
    sodium_total: { type: Number, default: 0 },
    sodium_average: { type: Number, default: 0 },
    sodium_most: { type: Number, default: 0 },
    sodium_least: { type: Number, default: 0 },
    sodium_excess: { type: Number, default: 0 },
    protein_total: { type: Number, default: 0 },
    protein_average: { type: Number, default: 0 },
    protein_most: { type: Number, default: 0 },
    protein_least: { type: Number, default: 0 },
    protein_excess: { type: Number, default: 0 },
    calcium_total: { type: Number, default: 0 },
    calcium_average: { type: Number, default: 0 },
    calcium_most: { type: Number, default: 0 },
    calcium_least: { type: Number, default: 0 },
    calcium_excess: { type: Number, default: 0 },
    carbs_total: { type: Number, default: 0 },
    carbs_average: { type: Number, default: 0 },
    carbs_most: { type: Number, default: 0 },
    carbs_least: { type: Number, default: 0 },
    carbs_excess: { type: Number, default: 0 },
    cholesterol_total: { type: Number, default: 0 },
    cholesterol_average: { type: Number, default: 0 },
    cholesterol_most: { type: Number, default: 0 },
    cholesterol_least: { type: Number, default: 0 },
    cholesterol_excess: { type: Number, default: 0 },
    polyunsaturated_total: { type: Number, default: 0 },
    polyunsaturated_average: { type: Number, default: 0 },
    polyunsaturated_most: { type: Number, default: 0 },
    polyunsaturated_least: { type: Number, default: 0 },
    polyunsaturated_excess: { type: Number, default: 0 },
    monounsaturated_total: { type: Number, default: 0 },
    monounsaturated_average: { type: Number, default: 0 },
    monounsaturated_most: { type: Number, default: 0 },
    monounsaturated_least: { type: Number, default: 0 },
    monounsaturated_excess: { type: Number, default: 0 },
    iron_total: { type: Number, default: 0 },
    iron_average: { type: Number, default: 0 },
    iron_most: { type: Number, default: 0 },
    iron_least: { type: Number, default: 0 },
    iron_excess: { type: Number, default: 0 },
    fiber_total: { type: Number, default: 0 },
    fiber_average: { type: Number, default: 0 },
    fiber_most: { type: Number, default: 0 },
    fiber_least: { type: Number, default: 0 },
    fiber_excess: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

// Compile model from schema
var UsersNutritions = mongoose.model(
  "users_nutritions",
  UsersNutritions,
  "users_nutritions"
);

module.exports = UsersNutritions;
