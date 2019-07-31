//Require Mongoose
var mongoose = require("mongoose");
var _ = require("underscore");
var constant = require("../constant");

//Define a schema
var Schema = mongoose.Schema;

var IngredientsIncludedSchema = new Schema({
    ingredient_id: { type: mongoose.Schema.Types.ObjectId, ref: "proximates" },
    serving_input: { type: Number },
    ingredient_unit: { type: String, default: 'g' },
    count: { type: Number }
});

var MealsSchema = new Schema({
    userId: { type: String, ref: "users", field: "authUserId", required: true },
    ingredientsIncluded: [IngredientsIncludedSchema],
    notes: { type: String },
    title: { type: String },
    image: { type: String },
    meals_type: { type: String },
    meals_visibility: { type: String },
    instructions: { type: String },
}, {
        versionKey: false
    });

// Compile model from schema
var Meals = mongoose.model("meals", MealsSchema, "meals");

module.exports = Meals;