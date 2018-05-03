//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var NutritionSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    ntrCode: { type: String, required: true, unique: true },
    unit: { type: String, required: true },
    type: {
      type: String,
      enum: ["nutrient", "single"],
      required: true,
      default: "nutrient"
    },
    min: { type: Number, required: true, default: 0 },
    max: { type: Number, required: true },
    step: { type: Number, required: true, default: 1 },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

// Compile model from schema
var Nutrition = mongoose.model("nutritions", NutritionSchema, "nutritions");

module.exports = Nutrition;
