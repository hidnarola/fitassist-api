var UserRecipes = require("./../models/users_recipe");
var UserWorkout = require("./../models/user_workouts");
var UsersRecipe = require("./../models/users_recipe");
var WorkoutLogs = require("./../models/workout_logs");
var user_recipe_helper = require("./user_recipe_helper");

var user_leaderboard_helper = {};

/*
 * get_strength is used to fetch all user  strength data
 * 
 * @return  status 0 - If any internal error occured while fetching strength data, with error
 *          status 1 - If strength data found, with strength object
 *          status 2 - If strength not found, with appropriate message
 */
user_leaderboard_helper.get_strength = async (condition = {}) => {
  try {
    var user_workouts = await WorkoutLogs.aggregate([
      {
        $match: condition
      },
      {
        $group: {
          _id: "$exerciseId",
          weight_lifted_total: { $sum: "$weight" },
          time_total: { $sum: "$time" },
          weight_lifted_average: { $avg: "$weight" },
          weight_lifted_most: { $max: "$weight" },
          weight_lifted_least: { $min: "$weight" },
          reps_least: { $min: "$reps" },
          reps_total: { $sum: "$reps" },
          reps_average: { $avg: "$reps" },
          reps_most: { $max: "$reps" },
          sets_least: { $min: "$sets" },
          sets_total: { $sum: "$sets" },
          sets_average: { $avg: "$sets" },
          sets_most: { $max: "$sets" },
          workouts_total: { $sum: 1 }
        }
      },
      {
        $project: {
          weight_lifted_total: 1,
          weight_lifted_average: 1,
          weight_lifted_most: 1,
          time_total: 1,
          weight_lifted_least: 1,
          reps_least: 1,
          reps_total: 1,
          reps_average: 1,
          reps_most: 1,
          sets_least: 1,
          sets_total: 1,
          sets_average: 1,
          sets_most: 1,
          workouts_total: 1
        }
      },
      {
        $group: {
          _id: null,
          weight_lifted_total: { $sum: "$weight_lifted_total" },
          weight_lifted_average: { $avg: "$weight_lifted_average" },
          workouts_total: { $sum: "$workouts_total" },
          reps_total: { $sum: "$reps_total" },
          sets_total: { $sum: "$sets_total" },
          workout_time: { $sum: "$time_total" }
          // weight_lifted_most: { $max: "$weight_lifted_most" },
          // weight_lifted_least: { $min: "$weight_lifted_least" },
          // reps_least: { $min: "$reps_least" },
          // reps_average: { $avg: "$reps_average" },
          // reps_most: { $max: "$reps_most" },
          // sets_least: { $min: "$sets_least" },
          // sets_average: { $avg: "$sets_average" },
          // sets_most: { $max: "$sets_most" }
        }
      }
    ]);
    // weight_lifted_total,weight_lifted_average,workouts_total,reps_total,sets_total, workout_time

    if (user_workouts) {
      return {
        status: 1,
        message: "User Strength data found",
        leaderboard: user_workouts[0]
      };
    } else {
      return { status: 2, message: "No User Strength data available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding User Strength data",
      error: err
    };
  }
};

/*
 * get_cardio is used to fetch all user  cardio data
 * 
 * @return  status 0 - If any internal error occured while fetching cardio data, with error
 *          status 1 - If cardio data found, with cardio object
 *          status 2 - If cardio not found, with appropriate message
 */
user_leaderboard_helper.get_cardio = async (condition = {}) => {
  try {
    var user_workouts = await WorkoutLogs.aggregate([
      {
        $match: condition
      },
      {
        $group: {
          _id: "$exerciseId",
          distance_total: { $sum: "$distance" },
          time_total: { $sum: "$time" },
          weight_lifted_average: { $avg: "$weight" },
          weight_lifted_most: { $max: "$weight" },
          weight_lifted_least: { $min: "$weight" },
          reps_least: { $min: "$reps" },
          reps_total: { $sum: "$reps" },
          reps_average: { $avg: "$reps" },
          reps_most: { $max: "$reps" },
          sets_least: { $min: "$sets" },
          sets_total: { $sum: "$sets" },
          sets_average: { $avg: "$sets" },
          sets_most: { $max: "$sets" },
          workouts_total: { $sum: 1 }
        }
      },
      {
        $project: {
          weight_lifted_total: 1,
          weight_lifted_average: 1,
          weight_lifted_most: 1,
          time_total: 1,
          weight_lifted_least: 1,
          reps_least: 1,
          reps_total: 1,
          reps_average: 1,
          reps_most: 1,
          sets_least: 1,
          sets_total: 1,
          sets_average: 1,
          sets_most: 1,
          workouts_total: 1
        }
      },
      {
        $group: {
          _id: null,
          weight_lifted_total: { $sum: "$weight_lifted_total" },
          weight_lifted_average: { $avg: "$weight_lifted_average" },
          workouts_total: { $sum: "$workouts_total" },
          reps_total: { $sum: "$reps_total" },
          sets_total: { $sum: "$sets_total" },
          workout_time: { $sum: "$time_total" }
          // weight_lifted_most: { $max: "$weight_lifted_most" },
          // weight_lifted_least: { $min: "$weight_lifted_least" },
          // reps_least: { $min: "$reps_least" },
          // reps_average: { $avg: "$reps_average" },
          // reps_most: { $max: "$reps_most" },
          // sets_least: { $min: "$sets_least" },
          // sets_average: { $avg: "$sets_average" },
          // sets_most: { $max: "$sets_most" }
        }
      }
    ]);
    // total_distance run, total time running,total elevation, distance cycled, total steps

    if (user_workouts) {
      return {
        status: 1,
        message: "User Cardio data found",
        leaderboard: user_workouts[0]
      };
    } else {
      return { status: 2, message: "No User Cardio data available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding User Cardio data",
      error: err
    };
  }
};

/*
 * get_nutrition is used to fetch all user nutrition data
 * 
 * @return  status 0 - If any internal error occured while fetching nutrition data, with error
 *          status 1 - If nutrition data found, with nutrition object
 *          status 2 - If nutrition not found, with appropriate message
 */
user_leaderboard_helper.get_nutrition = async (condition = {}) => {
  try {
    var user_nutrients = await UsersRecipe.aggregate([
      {
        $project: {
          _id: 1,
          isDeleted: 1,
          userId: 1,
          totalNutrients: 1,
          isCompleted: 1
        }
      },
      {
        $match: condition
      },
      { $unwind: "$totalNutrients" },
      {
        $group: {
          _id: "null",
          calories_total: { $sum: "$totalNutrients.ENERC_KCAL.quantity" },
          protein_average: { $avg: "$totalNutrients.PROCNT.quantity" },
          carbs_total: { $sum: "$totalNutrients.CHOCDF.quantity" },
          protein_total: { $sum: "$totalNutrients.PROCNT.quantity" }
          // calories_average: { $avg: "$totalNutrients.ENERC_KCAL.quantity" },
          // calories_most: { $max: "$totalNutrients.ENERC_KCAL.quantity" },
          // calories_least: { $min: "$totalNutrients.ENERC_KCAL.quantity" },
          // saturated_total: { $sum: "$totalNutrients.FASAT.quantity" },
          // saturated_average: { $avg: "$totalNutrients.FASAT.quantity" },
          // saturated_most: { $sum: "$totalNutrients.FASAT.quantity" },
          // saturated_least: { $sum: "$totalNutrients.FASAT.quantity" },
          // trans_total: { $sum: "$totalNutrients.FATRN.quantity" },
          // trans_average: { $avg: "$totalNutrients.FATRN.quantity" },
          // trans_most: { $sum: "$totalNutrients.FATRN.quantity" },
          // trans_least: { $sum: "$totalNutrients.FATRN.quantity" },
          // folate_total: { $sum: "$totalNutrients.FOLDFE.quantity" },
          // folate_average: { $avg: "$totalNutrients.FOLDFE.quantity" },
          // folate_most: { $sum: "$totalNutrients.FOLDFE.quantity" },
          // folate_least: { $sum: "$totalNutrients.FOLDFE.quantity" },
          // potassium_total: { $sum: "$totalNutrients.K.quantity" },
          // potassium_average: { $avg: "$totalNutrients.K.quantity" },
          // potassium_most: { $sum: "$totalNutrients.K.quantity" },
          // potassium_least: { $sum: "$totalNutrients.K.quantity" },
          // magnesium_total: { $sum: "$totalNutrients.MG.quantity" },
          // magnesium_average: { $avg: "$totalNutrients.MG.quantity" },
          // magnesium_most: { $sum: "$totalNutrients.MG.quantity" },
          // magnesium_least: { $sum: "$totalNutrients.MG.quantity" },
          // sodium_total: { $sum: "$totalNutrients.NA.quantity" },
          // sodium_average: { $avg: "$totalNutrients.NA.quantity" },
          // sodium_most: { $sum: "$totalNutrients.NA.quantity" },
          // sodium_least: { $sum: "$totalNutrients.NA.quantity" },
          // protein_most: { $sum: "$totalNutrients.PROCNT.quantity" },
          // protein_least: { $sum: "$totalNutrients.PROCNT.quantity" },
          // calcium_total: { $sum: "$totalNutrients.CA.quantity" },
          // calcium_average: { $avg: "$totalNutrients.CA.quantity" },
          // calcium_most: { $sum: "$totalNutrients.CA.quantity" },
          // calcium_least: { $sum: "$totalNutrients.CA.quantity" },
          // carbs_average: { $avg: "$totalNutrients.CHOCDF.quantity" },
          // carbs_most: { $sum: "$totalNutrients.CHOCDF.quantity" },
          // carbs_least: { $sum: "$totalNutrients.CHOCDF.quantity" },
          // cholesterol_total: { $sum: "$totalNutrients.CHOLE.quantity" },
          // cholesterol_average: { $avg: "$totalNutrients.CHOLE.quantity" },
          // cholesterol_most: { $sum: "$totalNutrients.CHOLE.quantity" },
          // cholesterol_least: { $sum: "$totalNutrients.CHOLE.quantity" },
          // polyunsaturated_total: { $sum: "$totalNutrients.FAPU.quantity" },
          // polyunsaturated_average: { $avg: "$totalNutrients.FAPU.quantity" },
          // polyunsaturated_most: { $sum: "$totalNutrients.FAPU.quantity" },
          // polyunsaturated_least: { $sum: "$totalNutrients.FAPU.quantity" },
          // monounsaturated_total: { $sum: "$totalNutrients.FAMS.quantity" },
          // monounsaturated_average: { $avg: "$totalNutrients.FAMS.quantity" },
          // monounsaturated_most: { $sum: "$totalNutrients.FAMS.quantity" },
          // monounsaturated_least: { $sum: "$totalNutrients.FAMS.quantity" },
          // iron_total: { $sum: "$totalNutrients.FE.quantity" },
          // iron_average: { $avg: "$totalNutrients.FE.quantity" },
          // iron_most: { $sum: "$totalNutrients.FE.quantity" },
          // iron_least: { $sum: "$totalNutrients.FE.quantity" },
          // fiber_total: { $sum: "$totalNutrients.FIBTG.quantity" },
          // fiber_average: { $avg: "$totalNutrients.FIBTG.quantity" },
          // fiber_most: { $sum: "$totalNutrients.FIBTG.quantity" },
          // fiber_least: { $sum: "$totalNutrients.FIBTG.quantity" }
        }
      }
    ]);

    if (user_nutrients) {
      return {
        status: 1,
        message: "User nutrition data found",
        leaderboard: user_nutrients
      };
    } else {
      return { status: 2, message: "No User nutrition data available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding User nutrition data",
      error: err
    };
  }
};

/*
 * get_body is used to fetch all user body data
 * 
 * @return  status 0 - If any internal error occured while fetching body data, with error
 *          status 1 - If body data found, with body object
 *          status 2 - If body not found, with appropriate message
 */
user_leaderboard_helper.get_body = async (condition = {}) => {
  try {
    var leaderboard_data = await UserWorkout.aggregate([
      {
        $match: condition
      },
      {
        $lookup: {
          from: "user_workout_exercises",
          foreignField: "userWorkoutsId",
          localField: "_id",
          as: "exercises"
        }
      },
      {
        $unwind: {
          path: "$exercises",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: {
          "exercises.isCompleted": 1
        }
      },
      {
        $group: {
          _id: null,
          weight_lifted_total: { $sum: "$exercises.baseWeightValue" },
          weight_lifted_average: { $avg: "$exercises.baseWeightValue" },
          weight_lifted_most: { $max: "$exercises.baseWeightValue" },
          weight_lifted_least: { $min: "$exercises.baseWeightValue" },
          reps_least: { $min: "$exercises.reps" },
          reps_total: { $sum: "$exercises.reps" },
          reps_average: { $avg: "$exercises.reps" },
          reps_most: { $max: "$exercises.reps" },
          sets_least: { $min: "$exercises.sets" },
          sets_total: { $sum: "$exercises.sets" },
          sets_average: { $avg: "$exercises.sets" },
          sets_most: { $max: "$exercises.sets" },
          workouts_total: { $addToSet: "$exercises" }
        }
      },
      {
        $project: {
          weight_lifted_total: 1,
          weight_lifted_average: 1,
          weight_lifted_most: 1,
          weight_lifted_least: 1,
          reps_least: 1,
          reps_total: 1,
          reps_average: 1,
          reps_most: 1,
          sets_least: 1,
          sets_total: 1,
          sets_average: 1,
          sets_most: 1,
          workouts_total: { $size: "$workouts_total" }
        }
      }
    ]);

    if (leaderboard_data) {
      return {
        status: 1,
        message: "User body data found",
        leaderboard: leaderboard_data
      };
    } else {
      return { status: 2, message: "No User body data available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding User body data",
      error: err
    };
  }
};

module.exports = user_leaderboard_helper;
