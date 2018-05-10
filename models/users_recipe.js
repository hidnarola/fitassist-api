//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var UserRecipes = new Schema(
  {
    userId: { type: String, ref: "users", field: "authUserId", required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    url: { type: String, required: true },
    dietLabels: [{ type: String}],
    healthLabels: [{ type: String}],
    ingredientLines: [{ type: String}],
    ingredients: [{ type: String}],
    calories: { type: String},
    totalWeight: { type: String},
    totalTime: { type: String},
    totalNutrients: { type: String},
    metaData,
    date: { type: Date, required:true},
    status: { type: Number, default: 1 },
    isDeleted: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

// Compile model from schema
var UserRecipes = mongoose.model(
  "user_recipes",
  UserRecipes,
  "user_recipes"
);

module.exports = UserRecipes;
