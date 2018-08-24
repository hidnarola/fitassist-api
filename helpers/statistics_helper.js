var UserRecipes = require("./../models/users_recipe");
var UserWorkout = require("./../models/user_workouts");
var UsersRecipe = require("./../models/users_recipe");
var WorkoutLogs = require("./../models/workout_logs");
var BodyMeasurements = require("./../models/body_measurements");
var user_settings_helper = require("./user_settings_helper");
var common_helper = require("./common_helper");
var moment = require("moment");
var user_recipe_helper = require("./user_recipe_helper");
var _ = require("underscore");

var statistics_helper = {};

/*
 * get_strength is used to fetch all user  strength data
 * 
 * @return  status 0 - If any internal error occured while fetching strength data, with error
 *          status 1 - If strength data found, with strength object
 *          status 2 - If strength not found, with appropriate message
 */
async function getSum(total, num) {
  return await total + num;
}
statistics_helper.get_strength = async (condition = {}) => {
  console.log('------------------------------------');
  console.log('condition : ', condition);
  console.log('------------------------------------');

  try {
    var user_workouts = await WorkoutLogs.aggregate([{
        $match: condition
      },
      {
        $lookup: {
          from: "user_workout_exercises",
          localField: "exerciseId",
          foreignField: "_id",
          as: "exercise"
        }
      },
      {
        $unwind: {
          path: "$exercise",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$exercise.exercises",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: {
          "exercise.exercises.exercises.category": "strength"
        }
      },
      {
        $group: {
          _id: "$exercise.exercises.exercises.subCategory",
          "fields": {
            $push: {
              "time": {
                "total": {
                  $sum: "$time"
                },
                "unit": 'second'
              },
              "distance": {
                "total": {
                  $sum: "$distance"
                },
                "unit": 'km'
              },
              "effort": {
                "total": {
                  $sum: "$effort"
                },
                "unit": ''
              },
              "weight": {
                "total": {
                  $sum: "$weight"
                },
                "unit": 'kg'
              },
              "repTime": {
                "total": {
                  $sum: "$repTime"
                },
                "unit": 'number'
              },
              "setTime": {
                "total": {
                  $sum: "$setTime"
                },
                "unit": 'second'
              },
              "reps": {
                "total": {
                  $sum: "$reps"
                },
                "unit": 'number'
              },
              "sets": {
                "total": {
                  $sum: "$sets"
                },
                "unit": 'number'
              },
            }
          },
          "exercises": {
            $addToSet: {
              name: "$exercise.exercises.exercises.name",
              _id: "$exercise.exercises.exercises._id"
            }
          },
        }
      },
      {
        $project: {
          _id: 0,
          subCategory: "$_id",
          exerciseId: 'all',
          exercises: "$exercises",
          fields: "$fields"
        }
      }

    ]);
    var measurement_unit_data = await user_settings_helper.get_setting({
      userId: condition.userId
    });
    if (measurement_unit_data.status === 1) {
      var distanceUnit = measurement_unit_data.user_settings.distance;
      var weightUnit = measurement_unit_data.user_settings.weight;
    }
    for (let w of user_workouts) {

      let time = _.pluck(_.pluck(w.fields, "time"), "total");
      let distance = _.pluck(_.pluck(w.fields, "distance"), "total");
      let effort = _.pluck(_.pluck(w.fields, "effort"), "total");
      let weight = _.pluck(_.pluck(w.fields, "weight"), "total");
      let repTime = _.pluck(_.pluck(w.fields, "repTime"), "total");
      let setTime = _.pluck(_.pluck(w.fields, "setTime"), "total");
      let reps = _.pluck(_.pluck(w.fields, "reps"), "total");
      let sets = _.pluck(_.pluck(w.fields, "sets"), "total");

      let totalTime = await time.reduce(getSum);
      let totalDistance = await distance.reduce(getSum);
      let totalEffort = await effort.reduce(getSum);
      let totalWeight = await weight.reduce(getSum);
      let totalRepTime = await repTime.reduce(getSum);
      let totalSetTime = await setTime.reduce(getSum);
      let totalReps = await reps.reduce(getSum);
      let totalSets = await sets.reduce(getSum);
      w.fields = {};
      w.fields.time = {
        total: await common_helper.convertUnits("second", "minute", totalTime),
        unit: "min"
      }
      w.fields.distance = {
        total: await common_helper.convertUnits("meter", distanceUnit, totalDistance),
        unit: distanceUnit
      }
      w.fields.effort = {
        total: totalEffort,
        unit: ""
      }
      w.fields.weight = {
        total: parseFloat(await common_helper.convertUnits("gram", weightUnit, totalWeight).toFixed(2)),
        unit: weightUnit
      }
      w.fields.repTime = {
        total: await common_helper.convertUnits("second", "minute", totalRepTime),
        unit: "min"
      }
      w.fields.setTime = {
        total: await common_helper.convertUnits("second", "minute", totalSetTime),
        unit: "min"
      }
      w.fields.reps = {
        total: totalReps,
        unit: ""
      }
      w.fields.sets = {
        total: totalSets,
        unit: ""
      }
    }

    if (user_workouts) {
      return {
        status: 1,
        message: "User Strength data found",
        statistics: {
          data: user_workouts
        }
      };
    } else {
      return {
        status: 2,
        message: "No User Strength data available",
        statistics: null
      };
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
 * @return  status 0 - If any internal error occured while fetching cardio data, with error
 *          status 1 - If cardio data found, with cardio object
 *          status 2 - If cardio not found, with appropriate message
 */
statistics_helper.get_cardio = async (condition = {}) => {
  try {
    var user_workouts = await WorkoutLogs.aggregate([{
        $match: condition
      },
      {
        $group: {
          _id: "$exerciseId",
          distance_total: {
            $sum: "$distance"
          },
          time_total: {
            $sum: "$time"
          },
          weight_lifted_total: {
            $sum: "$weight"
          },
          weight_lifted_average: {
            $avg: "$weight"
          },
          weight_lifted_most: {
            $max: "$weight"
          },
          weight_lifted_least: {
            $min: "$weight"
          },
          reps_least: {
            $min: "$reps"
          },
          reps_total: {
            $sum: "$reps"
          },
          reps_average: {
            $avg: "$reps"
          },
          reps_most: {
            $max: "$reps"
          },
          sets_least: {
            $min: "$sets"
          },
          sets_total: {
            $sum: "$sets"
          },
          sets_average: {
            $avg: "$sets"
          },
          sets_most: {
            $max: "$sets"
          },
          workouts_total: {
            $sum: 1
          }
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
          weight_lifted_total: {
            $sum: "$weight_lifted_total"
          },
          weight_lifted_average: {
            $avg: "$weight_lifted_average"
          },
          workouts_total: {
            $sum: "$workouts_total"
          },
          reps_total: {
            $sum: "$reps_total"
          },
          sets_total: {
            $sum: "$sets_total"
          },
          workout_time: {
            $sum: "$time_total"
          }
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
        statistics: user_workouts[0]
      };
    } else {
      return {
        status: 2,
        message: "No Use Cardio data available",
        statistics: null
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding User Cardio data",
      error: err
    };
  }
};


module.exports = statistics_helper;