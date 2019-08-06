//Require Mongoose
var mongoose = require("mongoose");
var _ = require("underscore");
var constant = require("../constant");

//Define a schema
var Schema = mongoose.Schema;

var MealsIncludedSchema = new Schema({
    meal_id: { type: mongoose.Schema.Types.ObjectId, ref: "meals" },
    createdAt: { type: Date, default: Date.now() }
});

var RecentMealSchema = new Schema({
    userId: { type: String, ref: "users", field: "authUserId", required: true},
    meals: [MealsIncludedSchema],
}, {
        versionKey: false
    });

// Compile model from schema
var RecentMeal = mongoose.model("recent_meal", RecentMealSchema, "recent_meal");

module.exports = RecentMeal;