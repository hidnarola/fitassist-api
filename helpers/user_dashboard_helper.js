var UserRecipes = require("./../models/users_recipe");
var UserWorkout = require("./../models/user_workouts");
var user_recipe_helper = require("./user_recipe_helper");
var user_workouts_helper = require("./user_workouts_helper");

var user_calendar_helper = {};

/*
 * get_calendar is used to fetch all user workout and meal data
 * 
 * @return  status 0 - If any internal error occured while fetching user workout and meal data, with error
 *          status 1 - If user workout and meal data found, with user workout and meal object
 *          status 2 - If user workout and meal not found, with appropriate message
 */
user_calendar_helper.get_calendar = async condition => {
  try {
    var calendar = {
      workouts: [],
      meals: []
    };

    var meal_data = await user_recipe_helper.get_user_recipe_by_id(condition);
    var workout_data = await user_workouts_helper.get_all_workouts_by_date(
      condition
    );

    if (meal_data.status == 1) {
      calendar.meals = meal_data.todays_meal;
    }
    if (workout_data) {
      calendar.workouts = workout_data.workouts;
    }

    if (calendar) {
      return {
        status: 1,
        message: "User calendar found",
        calendar: calendar
      };
    } else {
      return { status: 2, message: "No User calendar available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding User calendar",
      error: err
    };
  }
};

/*
 * complete_workouts is used to complete user workout schedule in to user_workout collection
 * @param  user_workout_obj     JSON object consist of all property that need to update in collection
 * @param  condition     JSON object consist of condition property that need to update in collection
 * @return  status  0 - If any error occur in completing workouts, with error
 *          status  1 - If workouts inserted, with inserted workouts document and appropriate message
 * @developed by "amc"
 */
user_calendar_helper.complete_workouts = async (
  condition,
  user_workout_obj
) => {
  try {
    let workouts = await UserWorkout.update(condition, user_workout_obj, {
      new: true
    });
    return {
      status: 1,
      message: "Workout completed",
      workouts: workouts
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while completing workout",
      error: err
    };
  }
};

module.exports = user_calendar_helper;
