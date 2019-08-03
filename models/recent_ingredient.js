//Require Mongoose
var mongoose = require("mongoose");
var _ = require("underscore");
var constant = require("../constant");

//Define a schema
var Schema = mongoose.Schema;

var IngredientsIncludedSchema = new Schema({
    ingredient_id: { type: mongoose.Schema.Types.ObjectId, ref: "proximates" },
    createdAt: { type: Date, default: Date.now() }
});

var RecentIngredientSchema = new Schema({
    userId: { type: String, ref: "users", field: "authUserId", required: true},
    ingredients: [IngredientsIncludedSchema],
}, {
        versionKey: false
    });

// Compile model from schema
var RecentIngredient = mongoose.model("recent_ingredient", RecentIngredientSchema, "recent_ingredient");

module.exports = RecentIngredient;