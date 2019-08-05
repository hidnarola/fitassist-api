var UserMeals = require("./../models/user_meals");
var meals_helper = {};

meals_helper.insert_meal = async meal_obj => {
  let meal = new UserMeals(meal_obj);
  try {
    let meal_data = await meal.save();
    if (meal_data) {
      return { status: 1, message: "meal inserted", meal: meal_data };
    } else {
      return {
        status: 0,
        message: "Error occured while inserting meal",
        error: err
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding meal",
      error: err
    };
  }
};

meals_helper.get_logdata_by_userid = async id => {
  try {
    var logdata = await UserMeals.find(id);
    //        var logdata = await Measurement.aggregate(id);
    if (logdata) {
      return {
        status: 1,
        message: "logdata found",
        logdates: logdata
      };
    } else {
      return {
        status: 2,
        message: "No logdata available"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding logdata",
      error: err
    };
  }
};

meals_helper.get_user_meal_by_id = async obj => {
  try {
    var user_meal = await UserMeals.find(obj);
    if (user_meal) {
      return {
        status: 1,
        message: "meal found",
        userMeals: user_meal
      };
    } else {
      return {
        status: 2,
        message: "No meal available"
      };
    }
  } catch (error) {
    return {
      status: 0,
      message: "Error occured while finding logdata",
      error: err
    };
  }
};

module.exports = meals_helper;
