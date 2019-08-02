var Meals = require("./../models/meals");
var meals_helper = {};

meals_helper.insert_meal = async meal_obj => {
  let meal = new Meals(meal_obj);
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

meals_helper.search_meal = async (projectObj, searchObj, start, offset) => {
  try {
    var meal_rep = await Meals.aggregate([
      projectObj,
      searchObj,

      {
        $unwind: "$ingredientsIncluded"
      },

      {
        $lookup: {
          from: "proximates",
          localField: "ingredientsIncluded.ingredient_id",
          foreignField: "_id",
          as: "mealsIngredient"
        }
      },
      {
        $unwind: "$mealsIngredient"
      },
      {
        $group: {
          _id: "$_id",
          ingredients: { $addToSet: "$mealsIngredient" },
          title: { $first: "$title" },
          meals_type: { $first: "$meals_type" },
          meals_visibility: { $first: "$meals_visibility" },
          userId: { $first: "$userId" },
          ingredientsIncluded: { $push: "$ingredientsIncluded" }
        }
      },
      start,
      offset
    ]);
    if (meal_rep) {
      return {
        status: 1,
        message: "meals found",
        meals: meal_rep
      };
    } else {
      return {
        status: 2,
        message: "No meals available"
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

module.exports = meals_helper;
