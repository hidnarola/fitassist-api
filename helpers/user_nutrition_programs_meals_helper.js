var UserNutritionProgramMeals = require("./../models/user_nutrition_programs_meals");
var user_nutrition_programs_meals = {};
var mongoose = require("mongoose");

user_nutrition_programs_meals.insert_meal = async meal_obj => {
  let meal = new UserNutritionProgramMeals(meal_obj);
  try {
    let meal_data = await meal.save();
    return { status: 1, message: "meal inserted", meal: meal_data };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting meal",
      error: err
    };
  }
};

user_nutrition_programs_meals.update_meal = async (condition, meal_obj) => {
  try {
    let resp_data = await UserNutritionProgramMeals.findOneAndUpdate(
      condition,
      meal_obj,
      {
        new: true
      }
    );
    if (!resp_data) {
      return {
        status: 2,
        message: "Record has not updated"
      };
    } else {
      return {
        status: 1,
        message: "Record has been updated",
        meal: resp_data
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating meal",
      error: err
    };
  }
};
user_nutrition_programs_meals.find_meal = async condition => {
  try {
    let copy_data = await UserNutritionProgramMeals.find(condition);
    if (copy_data.length === 0) {
      return {
        status: 2,
        message: "Record has not found"
      };
    } else {
      return {
        status: 1,
        message: "Record has been found",
        meal: copy_data
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while coying meal",
      error: err
    };
  }
};

user_nutrition_programs_meals.delete_user_meals_by_ids = async mealIds => {
  try {
    let user_meals_data = await UserNutritionProgramMeals.remove({
      _id: {
        $in: mealIds
      }
    });
    console.log("USER MEAL DELETE =====", user_meals_data);
    if (user_meals_data) {
      return {
        status: 1,
        message: "User program workouts deleted"
      };
    } else {
      return {
        status: 2,
        message: "User program workouts not deleted"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while deleting User program workouts",
      error: err
    };
  }
};

module.exports = user_nutrition_programs_meals;
