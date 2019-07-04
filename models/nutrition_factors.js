//Require Mongoose
var mongoose = require("mongoose");
var _ = require("underscore");
var constant = require("../constant");

//Define a schema
var Schema = mongoose.Schema;

var NutritionFactorSchema = new Schema({
  foodCode: {
    type: String,
    required: true
  },
  foodName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  group: {
    type: String,
    required: true
  },
  previous: {
    type: String
  },
  mainDataReference: {
    type: String
  },
  footNote: {
    type: String
  },
  edibleProportion: {
    type: String,
    required: true,
  },
  specificGravity: {
    type: Number,
  },
  totalSolids: {
    type: Number
  },
  nitrogenConversionFactor : {
    type: Number
  },
  glycerolConversionFactor: {
    type: Number
  }
}, {
  versionKey: false
});

// Compile model from schema
var NutritionFactors = mongoose.model("nutrition_factors", NutritionFactorSchema, "nutrition_factors");

module.exports = NutritionFactors;