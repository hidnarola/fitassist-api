var UserRecipes = require("./../models/users_recipe");
var UserWorkout = require("./../models/user_workouts");
var UsersRecipe = require("./../models/users_recipe");
var WorkoutLogs = require("./../models/workout_logs");
var BodyMeasurements = require("./../models/body_measurements");
var user_settings_helper = require("./user_settings_helper");
var common_helper = require("./common_helper");
var moment = require("moment");
var momentDurationFormatSetup = require("moment-duration-format");
var user_recipe_helper = require("./user_recipe_helper");
var _ = require("underscore");
momentDurationFormatSetup(moment);

var statistics_helper = {};

async function getSum(total, num) {
  return await total + num;
}

/*
 * get_statistics_data is used to fetch all user  statistics data
 * @return  status 0 - If any internal error occured while fetching statistics data, with error
 *          status 1 - If statistics data found, with statistics object
 *          status 2 - If statistics not found, with appropriate message
 */
statistics_helper.get_statistics_data = async (condition = {}, condition2 = {}, date = null) => {
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
        $match: condition2
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
      w.startDate = date.start ? date.start : null;
      w.endDate = date.end ? date.end : null;
      let time = _.pluck(_.pluck(w.fields, "time"), "total");
      let distance = _.pluck(_.pluck(w.fields, "distance"), "total");
      let effort = _.pluck(_.pluck(w.fields, "effort"), "total");
      let weight = _.pluck(_.pluck(w.fields, "weight"), "total");
      let repTime = _.pluck(_.pluck(w.fields, "repTime"), "total");
      let setTime = _.pluck(_.pluck(w.fields, "setTime"), "total");
      let reps = _.pluck(_.pluck(w.fields, "reps"), "total");
      let sets = _.pluck(_.pluck(w.fields, "sets"), "total");
      console.log('------------------------------------');
      console.log(' time: ', time);
      console.log(' distance: ', distance);
      console.log(' effort: ', effort);
      console.log(' weight: ', weight);
      console.log(' repTime: ', repTime);
      console.log(' setTime: ', setTime);
      console.log(' reps: ', reps);
      console.log(' sets: ', sets);
      console.log('------------------------------------');

      let totalTime = await time.reduce(getSum);
      let totalDistance = await distance.reduce(getSum);
      let totalEffort = await effort.reduce(getSum);
      let totalWeight = await weight.reduce(getSum);
      let totalRepTime = await repTime.reduce(getSum);
      let totalSetTime = await setTime.reduce(getSum);
      let totalReps = await reps.reduce(getSum);
      let totalSets = await sets.reduce(getSum);

      w.fields = {};
      var formatStringForTime = "h.m [hrs]";
      var formatStringForRepTime = "h.m [hrs]";
      var formatStringForSetTime = "h.m [hrs]";
      if (totalTime < 60) {
        formatStringForTime = "s [sec]";
      } else if (totalTime < 3600) {
        formatStringForTime = "m [min]";
      }
      if (totalSetTime < 60) {
        formatStringForSetTime = "s [sec]";
      } else if (totalSetTime < 3600) {
        formatStringForSetTime = "m [min]";
      }
      if (totalRepTime < 60) {
        formatStringForRepTime = "s [sec]";
      } else if (totalRepTime < 3600) {
        formatStringForRepTime = "m [min]";
      }
      w.fields.time = {
        total: totalTime > 0 ? moment.duration(totalTime, "seconds").format(formatStringForTime) : 0,
        unit: ""
      }
      w.fields.distance = {
        total: distanceUnit > 0 ? Math.round(await common_helper.convertUnits("meter", distanceUnit, totalDistance)) : 0,
        unit: distanceUnit
      }
      w.fields.effort = {
        total: totalEffort > 0 ? Math.round(totalEffort) : 0,
        unit: ""
      }
      w.fields.weight = {
        total: totalWeight > 0 ? Math.round(await common_helper.convertUnits("gram", weightUnit, totalWeight)) : 0,
        unit: weightUnit
      }
      w.fields.repTime = {
        total: totalRepTime > 0 ? moment.duration(totalRepTime, "seconds").format(formatStringForRepTime) : 0,
        unit: ""
      }
      w.fields.setTime = {
        total: totalSetTime > 0 ? moment.duration(totalSetTime, "seconds").format(formatStringForSetTime) : 0,
        unit: ""
      }
      w.fields.reps = {
        total: totalReps > 0 ? Math.round(totalReps) : 0,
        unit: ""
      }
      w.fields.sets = {
        total: totalSets > 0 ? Math.round(totalSets) : 0,
        unit: ""
      }
    }

    if (user_workouts && user_workouts.length > 0) {
      return {
        status: 1,
        message: "Success",
        statistics: {
          data: user_workouts
        }
      };
    } else {
      return {
        status: 1,
        statistics: null,
        message: "Success"
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
 * get_overview_statistics_data is used to fetch all user  statistics data
 * @return  status 0 - If any internal error occured while fetching statistics data, with error
 *          status 1 - If statistics data found, with statistics object
 *          status 2 - If statistics not found, with appropriate message
 */
statistics_helper.get_overview_statistics_data = async (condition = {}, date = null) => {
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
        $group: {
          _id: null,
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
          subCategory: "Overview",
          exerciseId: 'all',
          exercises: [],
          fields: "$fields"
        }
      }

    ]);
    return {
      status: 1,
      overview: user_workouts
    }
    var measurement_unit_data = await user_settings_helper.get_setting({
      userId: condition.userId
    });
    if (measurement_unit_data.status === 1) {
      var distanceUnit = measurement_unit_data.user_settings.distance;
      var weightUnit = measurement_unit_data.user_settings.weight;
    }
    for (let w of user_workouts) {
      w.startDate = date.start ? date.start : null;
      w.endDate = date.end ? date.end : null;
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
      var formatStringForTime = "h.m [hrs]";
      var formatStringForRepTime = "h.m [hrs]";
      var formatStringForSetTime = "h.m [hrs]";
      if (totalTime < 60) {
        formatStringForTime = "s [sec]";
      } else if (totalTime < 3600) {
        formatStringForTime = "m [min]";
      }
      if (totalSetTime < 60) {
        formatStringForSetTime = "s [sec]";
      } else if (totalSetTime < 3600) {
        formatStringForSetTime = "m [min]";
      }
      if (totalRepTime < 60) {
        formatStringForRepTime = "s [sec]";
      } else if (totalRepTime < 3600) {
        formatStringForRepTime = "m [min]";
      }
      w.fields.time = {
        total: totalTime > 0 ? moment.duration(totalTime, "seconds").format(formatStringForTime) : 0,
        unit: ""
      }
      w.fields.distance = {
        total: totalDistance > 0 ? Math.round(await common_helper.convertUnits("meter", distanceUnit, totalDistance)) : 0,
        unit: distanceUnit
      }
      w.fields.effort = {
        total: totalEffort > 0 ? Math.round(totalEffort) : 0,
        unit: ""
      }
      w.fields.weight = {
        total: totalWeight > 0 ? Math.round(await common_helper.convertUnits("gram", weightUnit, totalWeight)) : 0,
        unit: weightUnit
      }
      w.fields.repTime = {
        total: totalRepTime > 0 ? moment.duration(totalRepTime, "seconds").format(formatStringForRepTime) : 0,
        unit: ""
      }
      w.fields.setTime = {
        total: totalSetTime > 0 ? moment.duration(totalSetTime, "seconds").format(formatStringForSetTime) : 0,
        unit: ""
      }
      w.fields.reps = {
        total: totalReps > 0 ? Math.round(totalReps) : 0,
        unit: ""
      }
      w.fields.sets = {
        total: totalSets > 0 ? Math.round(totalSets) : 0,
        unit: ""
      }
    }

    if (user_workouts && user_workouts.length > 0) {
      return {
        status: 1,
        message: "Success",
        overview: user_workouts[0]
      };
    } else {
      return {
        status: 2
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
 * get_overview_graph_data is used to fetch all user all strength graph data 
 * @return  status 0 - If any internal error occured while fetching strength data, with error
 *          status 1 - If strength data found, with strength object
 *          status 2 - If strength not found, with appropriate message
 */
statistics_helper.get_overview_graph_data = async (condition = {}, activeField) => {
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
        $sort: {
          logDate: 1
        }
      },
      {
        $group: {
          _id: null,
          "fields": {
            $push: {
              "time": {
                "total": {
                  $sum: "$time"
                },
                "unit": 'second',
                "date": "$logDate"
              },
              "distance": {
                "total": {
                  $sum: "$distance"
                },
                "unit": 'meter',
                "date": "$logDate"
              },
              "effort": {
                "total": {
                  $sum: "$effort"
                },
                "unit": '',
                "date": "$logDate"
              },
              "weight": {
                "total": {
                  $sum: "$weight"
                },
                "unit": 'gram',
                "date": "$logDate"
              },
              "repTime": {
                "total": {
                  $sum: "$repTime"
                },
                "unit": 'number',
                "date": "$logDate"
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
                "unit": 'number',
                "date": "$logDate"
              },
              "sets": {
                "total": {
                  $sum: "$sets"
                },
                "unit": 'number',
                "date": "$logDate"
              },
            }
          },
        }
      },
      {
        $project: {
          _id: 0,
          subCategory: "Overview",
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
    var graphData = [];
    for (let w of user_workouts) {
      for (let field of w.fields) {
        var tmp = {
          "metaData": {
            name: activeField,
          },
          "date": moment(field[activeField].date).format("DD/MM/YYYY"),
        }
        if (activeField === "weight") {
          tmp.count = parseFloat((await common_helper.convertUnits("gram", weightUnit, field[activeField].total)).toFixed(2))
          tmp.metaData.unit = weightUnit;
        } else if (activeField === "time" || activeField === "repTime" || activeField === "setTime") {
          tmp.count = await common_helper.convertUnits("second", "minute", field[activeField].total)
          tmp.metaData.unit = minute;
        } else if (activeField === "distance") {
          tmp.count = parseFloat((await common_helper.convertUnits("cm", distanceUnit, field[activeField].total)).toFixed(2))
          tmp.metaData.unit = distanceUnit;
        } else {
          tmp.count = parseInt(field[activeField].total)
          tmp.metaData.unit = field[activeField].unit;
        }
        graphData.push(tmp)
      }
    }


    if (user_workouts && user_workouts.length > 0) {
      return {
        status: 1,
        message: "Success",
        graphData
      };
    } else {
      return {
        status: 2,
        message: "Error",
        graphData: null
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error while finding data",
      error: err
    };
  }
};
/*
 * get_graph_data is used to fetch all user all strength graph data 
 * @return  status 0 - If any internal error occured while fetching strength data, with error
 *          status 1 - If strength data found, with strength object
 *          status 2 - If strength not found, with appropriate message
 */
statistics_helper.get_graph_data = async (condition = {}, condition2 = {}, activeField) => {
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
        $match: condition2
      },
      {
        $sort: {
          logDate: 1
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
                "unit": 'second',
                "date": "$logDate"
              },
              "distance": {
                "total": {
                  $sum: "$distance"
                },
                "unit": 'meter',
                "date": "$logDate"
              },
              "effort": {
                "total": {
                  $sum: "$effort"
                },
                "unit": '',
                "date": "$logDate"
              },
              "weight": {
                "total": {
                  $sum: "$weight"
                },
                "unit": 'gram',
                "date": "$logDate"
              },
              "repTime": {
                "total": {
                  $sum: "$repTime"
                },
                "unit": 'number',
                "date": "$logDate"
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
                "unit": 'number',
                "date": "$logDate"
              },
              "sets": {
                "total": {
                  $sum: "$sets"
                },
                "unit": 'number',
                "date": "$logDate"
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
    var graphData = [];
    for (let w of user_workouts) {
      for (let field of w.fields) {
        var tmp = {
          "metaData": {
            name: activeField,
          },
          "date": moment(field[activeField].date).format("DD/MM/YYYY"),
        }
        if (activeField === "weight") {
          tmp.count = parseFloat((await common_helper.convertUnits("gram", weightUnit, field[activeField].total)).toFixed(2))
          tmp.metaData.unit = weightUnit;
        } else if (activeField === "time" || activeField === "repTime" || activeField === "setTime") {
          tmp.count = await common_helper.convertUnits("second", "minute", field[activeField].total)
          tmp.metaData.unit = minute;
        } else if (activeField === "distance") {
          tmp.count = parseFloat((await common_helper.convertUnits("cm", distanceUnit, field[activeField].total)).toFixed(2))
          tmp.metaData.unit = distanceUnit;
        } else {
          tmp.count = parseInt(field[activeField].total)
          tmp.metaData.unit = field[activeField].unit;
        }
        graphData.push(tmp)
      }
    }

    if (user_workouts && user_workouts.length > 0) {
      return {
        status: 1,
        message: "Success",
        graphData
      };
    } else {
      return {
        status: 2,
        message: "Error",
        graphData: null
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error while finding data",
      error: err
    };
  }
};


/*
 * get_overview_single_data is used to fetch all user  statistics single data
 * @return  status 0 - If any internal error occured while fetching statistics single data, with error
 *          status 1 - If single statistics data found, with single statistics object
 *          status 2 - If single statistics not found, with appropriate message
 */
statistics_helper.get_overview_single_data = async (condition = {}, date = null) => {
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
        $group: {
          _id: null,
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
          subCategory: "Overview",
          exerciseId: [],
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

      w.startDate = date.start ? date.start : null;
      w.endDate = date.end ? date.end : null;

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
      var formatStringForTime = "h.m [hrs]";
      var formatStringForRepTime = "h.m [hrs]";
      var formatStringForSetTime = "h.m [hrs]";
      if (totalTime < 60) {
        formatStringForTime = "s [sec]";
      } else if (totalTime < 3600) {
        formatStringForTime = "m [min]";
      }
      if (totalSetTime < 60) {
        formatStringForSetTime = "s [sec]";
      } else if (totalSetTime < 3600) {
        formatStringForSetTime = "m [min]";
      }
      if (totalRepTime < 60) {
        formatStringForRepTime = "s [sec]";
      } else if (totalRepTime < 3600) {
        formatStringForRepTime = "m [min]";
      }
      w.fields.time = {
        total: moment.duration(totalTime, "seconds").format(formatStringForTime),
        unit: ""
      }
      w.fields.distance = {
        total: Math.round(await common_helper.convertUnits("meter", distanceUnit, totalDistance)),
        unit: distanceUnit
      }
      w.fields.effort = {
        total: Math.round(totalEffort),
        unit: ""
      }
      w.fields.weight = {
        total: Math.round(await common_helper.convertUnits("gram", weightUnit, totalWeight)),
        unit: weightUnit
      }
      w.fields.repTime = {
        total: moment.duration(totalRepTime, "seconds").format(formatStringForRepTime),
        unit: ""
      }
      w.fields.setTime = {
        total: moment.duration(totalSetTime, "seconds").format(formatStringForSetTime),
        unit: "min"
      }
      w.fields.reps = {
        total: Math.round(totalReps),
        unit: ""
      }
      w.fields.sets = {
        total: Math.round(totalSets),
        unit: ""
      }
    }

    if (user_workouts && user_workouts.length > 0) {
      return {
        status: 1,
        message: "Success",
        statistics: user_workouts[0]
      };
    } else {
      return {
        status: 1,
        message: "Success",
        statistics: []
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
 * get_statistics_single_data is used to fetch all user  statistics single data
 * @return  status 0 - If any internal error occured while fetching statistics single data, with error
 *          status 1 - If single statistics data found, with single statistics object
 *          status 2 - If single statistics not found, with appropriate message
 */
statistics_helper.get_statistics_single_data = async (condition = {}, condition2 = {}, date = null) => {
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
        $match: condition2
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
          exerciseId: condition2["exercise.exercises.exercises._id"],
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

      w.startDate = date.start ? date.start : null;
      w.endDate = date.end ? date.end : null;

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
      var formatStringForTime = "h.m [hrs]";
      var formatStringForRepTime = "h.m [hrs]";
      var formatStringForSetTime = "h.m [hrs]";
      if (totalTime < 60) {
        formatStringForTime = "s [sec]";
      } else if (totalTime < 3600) {
        formatStringForTime = "m [min]";
      }
      if (totalSetTime < 60) {
        formatStringForSetTime = "s [sec]";
      } else if (totalSetTime < 3600) {
        formatStringForSetTime = "m [min]";
      }
      if (totalRepTime < 60) {
        formatStringForRepTime = "s [sec]";
      } else if (totalRepTime < 3600) {
        formatStringForRepTime = "m [min]";
      }
      w.fields.time = {
        total: moment.duration(totalTime, "seconds").format(formatStringForTime),
        unit: ""
      }
      w.fields.distance = {
        total: Math.round(await common_helper.convertUnits("meter", distanceUnit, totalDistance)),
        unit: distanceUnit
      }
      w.fields.effort = {
        total: Math.round(totalEffort),
        unit: ""
      }
      w.fields.weight = {
        total: Math.round(await common_helper.convertUnits("gram", weightUnit, totalWeight)),
        unit: weightUnit
      }
      w.fields.repTime = {
        total: moment.duration(totalRepTime, "seconds").format(formatStringForRepTime),
        unit: ""
      }
      w.fields.setTime = {
        total: moment.duration(totalSetTime, "seconds").format(formatStringForSetTime),
        unit: "min"
      }
      w.fields.reps = {
        total: Math.round(totalReps),
        unit: ""
      }
      w.fields.sets = {
        total: Math.round(totalSets),
        unit: ""
      }
    }

    if (user_workouts && user_workouts.length > 0) {
      return {
        status: 1,
        message: "Success",
        statistics: user_workouts[0]
      };
    } else {
      return {
        status: 2
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
 * get_strength_single_graph_data is used to fetch all user single strength graph data
 * @return  status 0 - If any internal error occured while fetching strength data, with error
 *          status 1 - If strength data found, with strength object
 *          status 2 - If strength not found, with appropriate message
 */
statistics_helper.get_strength_single_graph_data = async (condition = {}, condition2 = {}) => {
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
        $match: condition2
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
          exerciseId: condition2["exercise.exercises.exercises._id"],
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
      var formatStringForTime = "h.m [hrs]";
      var formatStringForRepTime = "h.m [hrs]";
      var formatStringForSetTime = "h.m [hrs]";
      if (totalTime < 60) {
        formatStringForTime = "s [sec]";
      } else if (totalTime < 3600) {
        formatStringForTime = "m [min]";
      }
      if (totalSetTime < 60) {
        formatStringForSetTime = "s [sec]";
      } else if (totalSetTime < 3600) {
        formatStringForSetTime = "m [min]";
      }
      if (totalRepTime < 60) {
        formatStringForRepTime = "s [sec]";
      } else if (totalRepTime < 3600) {
        formatStringForRepTime = "m [min]";
      }
      w.fields.time = {
        total: moment.duration(totalTime, "seconds").format(formatStringForTime),
        unit: ""
      }
      w.fields.distance = {
        total: Math.round(await common_helper.convertUnits("meter", distanceUnit, totalDistance)),
        unit: distanceUnit
      }
      w.fields.effort = {
        total: Math.round(totalEffort),
        unit: ""
      }
      w.fields.weight = {
        total: Math.round(await common_helper.convertUnits("gram", weightUnit, totalWeight)),
        unit: weightUnit
      }
      w.fields.repTime = {
        total: moment.duration(totalRepTime, "seconds").format(formatStringForRepTime),
        unit: ""
      }
      w.fields.setTime = {
        total: moment.duration(totalSetTime, "seconds").format(formatStringForSetTime),
        unit: "min"
      }
      w.fields.reps = {
        total: Math.round(totalReps),
        unit: ""
      }
      w.fields.sets = {
        total: Math.round(totalSets),
        unit: ""
      }
    }

    if (user_workouts && user_workouts.length > 0) {
      return {
        status: 1,
        message: "Success",
        statistics: user_workouts[0]
      };
    } else {
      return {
        status: 2,
        message: "Error",
        statistics: null
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error while finding data",
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

    if (user_workouts && user_workouts.length > 0) {
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