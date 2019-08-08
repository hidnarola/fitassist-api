var UserMeals = require("./../models/user_meals");
var RecentMeal = require("./../models/recent_meal");
var _ = require("underscore");
var meals_helper = {};
var mongoose = require("mongoose");

// not used
meals_helper.insert_recent_meal = async meals_obj => {
  try {
    let recent_meals = await RecentMeal.findOne({ userId: meals_obj.userId });

    if (recent_meals && recent_meals.meals && recent_meals.meals.length > 0) {
      // meals available for userId

      let _recent_meal = [];
      recent_meals.meals.forEach(element => {
        _recent_meal.push({
          ...element,
          meal_id: String(element.meal_id)
        });
      });
      var _new_meal = meals_obj.meals;

      _new_meal.forEach((element, id) => {
        let firstEl = _recent_meal[0];
        let firstEl2 = element;

        let _index = _.findIndex(_recent_meal, { meal_id: element.meal_id });

        if (_index >= 0) {
          // update createdAt
          _recent_meal[_index] = {
            ...element,
            createdAt: new Date()
          };
        } else {
          if (_recent_meal.length >= 10) {
            // pop and push
            _recent_meal = _.sortBy(_recent_meal, ["createdAt"]).reverse();
            _recent_meal.pop();
            _recent_meal.push(element);
          } else {
            // push
            _recent_meal.push(element);
          }
        }
      });

      // update query
      var updated_object = await RecentMeal.update(
        { _id: recent_meals._id },
        {
          $set: {
            meals: _recent_meal
          }
        }
      );
    } else {
      // meal not available for userId
      console.log("meals_obj.meals.length => ", meals_obj.meals.length);

      if (
        meals_obj.meals &&
        meals_obj.meals.length > 0 &&
        meals_obj.meals.length < 11
      ) {
        // insert all ingredient
        var added_meals = await RecentMeal.create({
          userId: meals_obj.userId,
          meals: meals_obj.meals
        });

        console.log("added_meals =>", added_meals);
      } else if (meals_obj.meals.length > 10) {
        // insert last 10 ingredient
        var arr = meals_obj.meals;
        var oder_data = arr.slice(-10);
        console.log("order_data => ", oder_data);

        var added_ingredient = await RecentMeal.create({
          userId: meals_obj.userId,
          meals: oder_data
        });
      } else {
        // no incoming meals
        console.log("else => ");
        console.log("no incoming meals");
      }
    }
  } catch (err) {
    console.log(err);
  }
};

meals_helper.insert_favourite_meal = async meals_obj => {
  try {
    let recent_meals = await RecentMeal.findOne({ userId: meals_obj.userId });
    // console.log('recent_meals => ',recent_meals);
    if (recent_meals !== null) {
      console.log("user is exits => ");
      let checkMeal = await RecentMeal.findOne({
        userId: meals_obj.userId,
        "meals.meal_id": meals_obj.meal_id
      });
      if (checkMeal !== null) {
        console.log("user is exists but meal is exists so remove meal=> ");
        // remove that meal id
        var updated_object = await RecentMeal.update(
          { _id: recent_meals._id },
          {
            $pull: {
              meals: { meal_id: mongoose.Types.ObjectId(meals_obj.meal_id) }
            }
          }
        );
      } else {
        console.log("user is found but meal is not found so add => ");
        // meal Id add
        var updated_object = await RecentMeal.update(
          { _id: recent_meals._id },
          {
            $push: {
              meals: { meal_id: mongoose.Types.ObjectId(meals_obj.meal_id) }
            }
          }
        );
      }
    } else {
      var added_meals = await RecentMeal.create({
        userId: meals_obj.userId,
        meals: [{ meal_id: meals_obj.meal_id }]
      });
      console.log("user is not found so added user and meal");
    }
    var new_recent_meals = await RecentMeal.aggregate([
      {
        $match: { userId: meals_obj.userId }
      },
      { $unwind: "$meals" },
      {
        $lookup: {
          from: "meals",
          localField: "meals.meal_id",
          foreignField: "_id",
          as: "meals"
        }
      },
      { $unwind: "$meals" },
      {
        $addFields: { "meals.isfav": true }
      },
      {
        $group: {
          _id: "$_id",
          meals: { $push: "$meals" },
          userId: { $first: "$userId" }
        }
      }
    ]);
    return {
      status: 1,
      message: "meal removed from favourites",
      remove: true,
      meal: new_recent_meals
    };
  } catch (err) {
    console.log(err);

    return {
      status: 0,
      message: "Error occured while inserting meal",
      error: err
    };
  }
};

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
  console.log("obj => ", obj);
  try {
    var user_meal = await UserMeals.aggregate([
      obj,
      {
        $unwind: "$meals"
      },
      {
        $lookup: {
          from: "meals",
          localField: "meals.meal_id",
          foreignField: "_id",
          as: "mealsDetails"
        }
      },
      {
        $unwind: "$mealsDetails"
      },
      {
        $group: {
          _id: "$_id",
          date: { $first: "$date" },
          userId: { $first: "$userId" },
          created_at: { $first: "$created_at" },
          updated_at: { $first: "$updated_at" },
          meals: { $push: "$mealsDetails" }
        }
      }
    ]);
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
      error: error
    };
  }
};

meals_helper.get_favourite_meals = async obj => {
  try {
    var user_meal = await RecentMeal.aggregate([
      {
        $match: obj
      },
      { $unwind: "$meals" },
      {
        $lookup: {
          from: "meals",
          localField: "meals.meal_id",
          foreignField: "_id",
          as: "meals"
        }
      },
      { $unwind: "$meals" },
      {
        $addFields: { "meals.isfav": true }
      },
      {
        $group: {
          _id: "$_id",
          meals: { $push: "$meals" },
          userId: { $first: "$userId" }
        }
      }
    ]);
    if (user_meal) {
      return {
        status: 1,
        message: "favurite meal found",
        userMeals: user_meal
      };
    } else {
      return {
        status: 2,
        message: "No favurite meal available"
      };
    }
  } catch (error) {
    console.log("error => ", error);
    return {
      status: 0,
      message: "Error occured while finding favurite meal data",
      error: error
    };
  }
};

module.exports = meals_helper;
