//Require Mongoose
var mongoose = require("mongoose");
var _ = require("underscore");
var constant = require("../constant");

//Define a schema
var Schema = mongoose.Schema;

var MealsSchema = new Schema({
  meal_id: { type: mongoose.Schema.Types.ObjectId, ref: "meals" }
});

var UserMealsSchema = new Schema(
  {
    userId: { type: String, ref: "users", field: "authUserId", required: true },
    meals: [MealsSchema],
    date: { type: Date, required: true }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

var UserMeals = mongoose.model("user_meals", UserMealsSchema, "user_meals");

module.exports = UserMeals;
