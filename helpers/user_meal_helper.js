var UserMeals = require("./../models/user_meals");
var meals_helper = {};

meals_helper.insert_meal = async meal_obj => {
  let meal = new UserMeals(meal_obj);
  try {
    let meal_data = await meal.save();
  } catch (err) {
    return { status: 1, message: "meal inserted", meal: meal_data };
    return {
      status: 0,
      message: "Error occured while inserting meal",
      error: err
    };
  }
};

module.exports = meals_helper;
