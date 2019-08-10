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
      {
        $project: {
          title1: { $split: ["$title", ", "] },
          title: 1,
          meals_type: 1,
          meals_visibility: 1,
          ingredientsIncluded: 1,
          userId: 1,
          image: 1
        }
      },
      {
        $group: {
          _id: "$_id",
          title1: { $first: "$title1" },
          title: { $first: "$title" },
          meals_type: { $first: "$meals_type" },
          meals_visibility: { $first: "$meals_visibility" },
          ingredientsIncluded: { $first: "$ingredientsIncluded" },
          userId: { $first: "$userId" },
          image: { $first: "$image" }
        }
      },
      {
        $project: {
          title: "$title",
          title1: "$title1",
          title2: {
            $reduce: {
              input: "$title1",
              initialValue: "",
              in: {
                $concat: [
                  "$$value",
                  { $cond: [{ $eq: ["$$value", ""] }, "", " "] },
                  "$$this"
                ]
              }
            }
          },
          meals_type: "$meals_type",
          meals_visibility: "$meals_visibility",
          ingredientsIncluded: "$ingredientsIncluded",
          userId: "$userId",
          image: "$image"
        }
      },
      searchObj,
      // {
      //   $unwind: "$ingredientsIncluded"
      // },
      // {
      //   $lookup: {
      //     from: "proximates",
      //     localField: "ingredientsIncluded.ingredient_id",
      //     foreignField: "_id",
      //     as: "mealsIngredient"
      //   }
      // },
      // {
      //   $unwind: "$mealsIngredient"
      // },
      // {
      //   $lookup: {
      //     from: "recent_meal",
      //     localField: "userId",
      //     foreignField: "userId",
      //     as: "recent_meals"
      //   }
      // },
      // {
      //   $unwind: "$recent_meals"
      // },
      // {
      //   $group: {
      //     _id: "$_id",
      //     ingredients: { $addToSet: "$mealsIngredient" },
      //     title: { $first: "$title" },
      //     meals_type: { $first: "$meals_type" },
      //     meals_visibility: { $first: "$meals_visibility" },
      //     userId: { $first: "$userId" },
      //     ingredientsIncluded: { $push: "$ingredientsIncluded" },
      //     recent_meals: { $first: "$recent_meals.meals.meal_id" },
      //   }
      // },
      // {
      //   $project: {
      //     _id: 1,
      //     ingredients: 1,
      //     title:1,
      //     meals_type: 1,
      //     meals_visibility:1,
      //     userId:1,
      //     ingredientsIncluded: 1,
      //     "isfav": {
      //       $in: ["$_id", "$recent_meals"]
      //     }
      //   }
      // },
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
