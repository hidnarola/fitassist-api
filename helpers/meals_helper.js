var Meals = require("./../models/meals");
var meals_helper = {};
var mongoose = require("mongoose");

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

meals_helper.search_meal = async (projectObj, searchObj,filterObj,matchObj, start, offset) => {
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
      filterObj,
      matchObj,
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

meals_helper.get_meal_id = async id => {
  try {
    // var meal = await Meals.findOne({
    //   _id: id
    // });


    var meal = await Meals.aggregate([
      {
        $match: { "_id": mongoose.Types.ObjectId(id) }
      },
      {
        $unwind: "$ingredientsIncluded"
      },
      {
        $lookup: {
          from: "proximates",
          localField: "ingredientsIncluded.ingredient_id",
          foreignField: "_id",
          as: "ingredient_detail"
        }
      },
      {
        $unwind: "$ingredient_detail"
      },
      {
        $group: {
          _id: "$_id",
          "ingredient_detail": { "$push": "$ingredient_detail" },
          title: { $first: "$title" },
          notes: { $first: "$notes" },
          meals_type: { $first: "$meals_type" },
          meals_visibility: { $first: "$meals_visibility" },
          instructions: { $first: "$instructions" },
          userId: { $first: "$userId" },
          image: { $first: "$image" },
          ingredientsIncluded: {
            $addToSet: "$$ROOT.ingredientsIncluded"
          }
        }
      }

    ])

    if (meal) {
      return {
        status: 1,
        message: "meal found",
        meal: meal
      };
    } else {
      return {
        status: 2,
        message: "No meal available"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding meal ",
      error: err
    };
  }
};

meals_helper.edit_meal_id = async (id, mealObj) => {
  try {
    var meal = await Meals.findByIdAndUpdate(
      {
        _id: id
      },
      mealObj,
      {
        new: true
      }
    );

    if (meal) {
      return {
        status: 1,
        message: "meal edited successfully",
        meal: meal
      };
    } else {
      return {
        status: 2,
        message: "No meal available"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while editing meal ",
      error: err
    };
  }
};

module.exports = meals_helper;
