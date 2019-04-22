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
statistics_helper.get_statistics_data = async (condition = {}, date = null) => {
  try {
    var user_workouts = await WorkoutLogs.aggregate([{
      $match: condition
    },
    {
      $group: {
        _id: "$subType",
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
            "restTime": {
              "total": {
                $sum: "$restTime"
              },
              "unit": ''
            },
            "speed": {
              "total": {
                $sum: "$speed"
              },
              "unit": ''
            },
          }
        },
        "exercises": {
          $addToSet: {
            name: "$name",
            _id: "$exerciseId"
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
        fields: "$fields",
        startDate: date.start,
        endDate: date.end
      }
    }
    ]);


    var measurement_unit_data = await user_settings_helper.get_setting({
      userId: condition.userId
    });
    if (measurement_unit_data.status === 1) {
      var distanceUnit = measurement_unit_data.user_settings.distance;
      var weightUnit = measurement_unit_data.user_settings.weight;
      var speedUnit = distanceUnit === "km" ? "kmph" : "mph";
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
      let restTime = _.pluck(_.pluck(w.fields, "restTime"), "total");
      let speed = _.pluck(_.pluck(w.fields, "speed"), "total");

      let totalTime = await time.reduce(getSum);
      let totalDistance = await distance.reduce(getSum);
      let totalEffort = await effort.reduce(getSum);
      let totalWeight = await weight.reduce(getSum);
      let totalRepTime = await repTime.reduce(getSum);
      let totalSetTime = await setTime.reduce(getSum);
      let totalReps = await reps.reduce(getSum);
      let totalSets = await sets.reduce(getSum);
      let totalRestTime = await restTime.reduce(getSum);
      let totalSpeed = await speed.reduce(getSum);

      w.fields = {};
      var formatStringForTime = "h.m [hrs]";
      var formatStringForRepTime = "h.m [hrs]";
      var formatStringForSetTime = "h.m [hrs]";
      var formatStringForRestTime = "h.m [hrs]";
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
      if (totalRestTime < 60) {
        formatStringForRestTime = "s [sec]";
      } else if (totalRestTime < 3600) {
        formatStringForRestTime = "m [min]";
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
      w.fields.restTime = {
        total: totalRestTime > 0 ? moment.duration(totalRestTime, "seconds").format(formatStringForRestTime) : 0,
        unit: ""
      }
      w.fields.speed = {
        total: totalSpeed > 0 ? Math.round(await common_helper.convertUnits("kmph", speedUnit, totalSpeed)) : 0,
        unit: speedUnit
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
      $group: {
        _id: null,
        time: {
          $sum: "$time"
        },
        distance: {
          $sum: "$distance"
        },
        effort: {
          $sum: "$effort"
        },
        weight: {
          $sum: "$weight"
        },
        repTime: {
          $sum: "$repTime"
        },
        setTime: {
          $sum: "$setTime"
        },
        reps: {
          $sum: "$reps"
        },
        sets: {
          $sum: "$sets"
        },
        restTime: {
          $sum: "$restTime"
        },
        speed: {
          $sum: "$speed"
        },
        "subCategory": {
          $first: "Overview"
        },
        "exerciseId": {
          $first: ""
        },
        "exercises": {
          $first: null
        }
      }
    },
    {
      $project: {
        _id: 0
      }
    }
    ]);

    var measurement_unit_data = await user_settings_helper.get_setting({
      userId: condition.userId
    });
    if (measurement_unit_data.status === 1) {
      var distanceUnit = measurement_unit_data.user_settings.distance;
      var weightUnit = measurement_unit_data.user_settings.weight;
      var speedUnit = distanceUnit === "km" ? "kmph" : "mph";
    }

    var returnObject = {};
    for (let w of user_workouts) {
      var formatStringForTime = "h.m [hrs]";
      var formatStringForRepTime = "h.m [hrs]";
      var formatStringForSetTime = "h.m [hrs]";
      var formatStringForRestTime = "h.m [hrs]";

      if (w.time < 60) {
        formatStringForTime = "s [sec]";
      } else if (w.time < 3600) {
        formatStringForTime = "m [min]";
      }
      if (w.sets < 60) {
        formatStringForSetTime = "s [sec]";
      } else if (w.sets < 3600) {
        formatStringForSetTime = "m [min]";
      }
      if (w.repTime < 60) {
        formatStringForRepTime = "s [sec]";
      } else if (w.repTime < 3600) {
        formatStringForRepTime = "m [min]";
      }
      if (w.restTime < 60) {
        formatStringForRestTime = "s [sec]";
      } else if (w.restTime < 3600) {
        formatStringForRestTime = "m [min]";
      }

      returnObject.subCategory = "Overview";
      returnObject.exerciseId = "all";
      returnObject.exercises = [];
      returnObject.fields = {};
      returnObject.startDate = date.start;
      returnObject.endDate = date.end;
      returnObject.fields.time = {
        total: w.time > 0 ? moment.duration(w.time, "seconds").format(formatStringForTime) : 0,
        unit: ""
      }
      returnObject.fields.distance = {
        total: w.distance > 0 ? Math.round(await common_helper.convertUnits("meter", distanceUnit, w.distance)) : 0,
        unit: distanceUnit
      }
      returnObject.fields.effort = {
        total: w.effort > 0 ? Math.round(w.effort) : 0,
        unit: ""
      }
      returnObject.fields.weight = {
        total: w.weight > 0 ? Math.round(await common_helper.convertUnits("gram", weightUnit, w.weight)) : 0,
        unit: weightUnit
      }
      returnObject.fields.repTime = {
        total: w.repTime > 0 ? moment.duration(w.repTime, "seconds").format(formatStringForRepTime) : 0,
        unit: ""
      }
      returnObject.fields.setTime = {
        total: w.setTime > 0 ? moment.duration(w.setTime, "seconds").format(formatStringForSetTime) : 0,
        unit: ""
      }
      returnObject.fields.reps = {
        total: w.reps > 0 ? Math.round(w.reps) : 0,
        unit: ""
      }
      returnObject.fields.sets = {
        total: w.sets > 0 ? Math.round(w.sets) : 0,
        unit: ""
      }
      returnObject.fields.restTime = {
        total: w.restTime > 0 ? moment.duration(w.restTime, "seconds").format(formatStringForRestTime) : 0,
        unit: ""
      }
      returnObject.fields.speed = {
        total: w.speed > 0 ? Math.round(await common_helper.convertUnits("kmph", speedUnit, w.speed)) : 0,
        unit: speedUnit
      }
    }

    if (user_workouts && user_workouts.length > 0) {
      return {
        status: 1,
        message: "Success",
        overview: returnObject
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
 * graph_data is used to fetch all user all strength graph data 
 * @return  status 0 - If any internal error occured while fetching strength data, with error
 *          status 1 - If strength data found, with strength object
 *          status 2 - If strength not found, with appropriate message
 */
statistics_helper.graph_data = async (condition = {}, activeField, userId) => {
  try {
    var user_workouts = await WorkoutLogs.aggregate([{
      $match: condition
    },
    {
      $group: {
        _id: "$logDate",
        "time": {
          $sum: "$time"
        },
        "distance": {
          $sum: "$distance"
        },
        "effort": {
          $sum: "$effort"
        },
        "weight": {
          $sum: "$weight"
        },
        "repTime": {
          $sum: "$repTime"
        },
        "setTime": {
          $sum: "$setTime"
        },
        "sets": {
          $sum: "$sets"
        },
        "reps": {
          $sum: "$reps"
        },
        "restTime": {
          $sum: "$restTime"
        },
        "speed": {
          $sum: "$speed"
        },
      }
    },
    {
      $sort: {
        _id: 1
      }
    }
    ]);

    var measurement_unit_data = await user_settings_helper.get_setting({
      userId: userId
    });
    var distanceUnit;
    var weightUnit;
    var speedUnit;
    var graphData = [];

    if (measurement_unit_data.status === 1) {
      distanceUnit = measurement_unit_data.user_settings.distance;
      weightUnit = measurement_unit_data.user_settings.weight;
      speedUnit = distanceUnit === "km" ? "kmph" : "mph";
    } else {
      distanceUnit = "km";
      weightUnit = "cm";
      speedUnit = distanceUnit === "km" ? "kmph" : "mph";
    }

    for (let w of user_workouts) {
      var tmp = {
        metaData: {
          name: activeField,
        },
        date: w._id,
        dateToCompare: moment(w._id).format("DD/MM/YYYY"),
      }

      if (activeField === "weight") {
        tmp.count = parseFloat((await common_helper.convertUnits("gram", weightUnit, w[activeField])).toFixed(2))
        tmp.metaData.unit = weightUnit;
      } else if (activeField === "time" || activeField === "repTime" || activeField === "setTime" || activeField === "restTime") {
        tmp.count = parseFloat((await common_helper.convertUnits("second", "minute", w[activeField])).toFixed(2))
        tmp.metaData.unit = "minute";
      } else if (activeField === "distance") {
        tmp.count = parseFloat((await common_helper.convertUnits("meter", distanceUnit, w[activeField])).toFixed(2))
        tmp.metaData.unit = distanceUnit;
      } else if (activeField === "speed") {
        tmp.count = parseFloat((await common_helper.convertUnits("kmph", speedUnit, w[activeField])).toFixed(2))
        tmp.metaData.unit = speedUnit;
      } else if (activeField === "effort") {
        tmp.count = parseInt(w[activeField])
        tmp.metaData.unit = "%";
      } else {
        tmp.count = parseInt(w[activeField])
        tmp.metaData.unit = "";
      }
      graphData.push(tmp)
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
            "restTime": {
              "total": {
                $sum: "$restTime"
              },
              "unit": 'second'
            },
            "speed": {
              "total": {
                $sum: "$speed"
              },
              "unit": 'kmph'
            },
          }
        },
        "exercises": {
          $addToSet: {
            name: "$name",
            _id: "$exerciseId"
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
      var speedUnit = distanceUnit === "km" ? "kmph" : "mph";
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
      let restTime = _.pluck(_.pluck(w.fields, "restTime"), "total");
      let speed = _.pluck(_.pluck(w.fields, "speed"), "total");

      let totalTime = await time.reduce(getSum);
      let totalDistance = await distance.reduce(getSum);
      let totalEffort = await effort.reduce(getSum);
      let totalWeight = await weight.reduce(getSum);
      let totalRepTime = await repTime.reduce(getSum);
      let totalSetTime = await setTime.reduce(getSum);
      let totalReps = await reps.reduce(getSum);
      let totalSets = await sets.reduce(getSum);
      let totalRestTime = await restTime.reduce(getSum);
      let totalSpeed = await speed.reduce(getSum);

      w.fields = {};
      var formatStringForTime = "h.m [hrs]";
      var formatStringForRepTime = "h.m [hrs]";
      var formatStringForSetTime = "h.m [hrs]";
      var formatStringForRestTime = "h.m [hrs]";

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
      if (totalRestTime < 60) {
        formatStringForRestTime = "s [sec]";
      } else if (totalRestTime < 3600) {
        formatStringForRestTime = "m [min]";
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
        unit: ""
      }
      w.fields.reps = {
        total: Math.round(totalReps),
        unit: ""
      }
      w.fields.sets = {
        total: Math.round(totalSets),
        unit: ""
      }
      w.fields.restTime = {
        total: moment.duration(totalRestTime, "seconds").format(formatStringForRestTime),
        unit: ""
      }
      w.fields.speed = {
        total: Math.round(await common_helper.convertUnits("kmph", speedUnit, totalSpeed)),
        unit: speedUnit
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
 * get_statistics_single_data is used to fetch all user  statistics single data
 * @return  status 0 - If any internal error occured while fetching statistics single data, with error
 *          status 1 - If single statistics data found, with single statistics object
 *          status 2 - If single statistics not found, with appropriate message
 */
statistics_helper.get_statistics_single_data = async (condition = {}, date = null) => {
  try {


    var user_workouts = await WorkoutLogs.aggregate([{
      $match: condition
    },
    {
      $group: {
        _id: "$subType",
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
            "restTime": {
              "total": {
                $sum: "$restTime"
              },
              "unit": 'number'
            },
            "speed": {
              "total": {
                $sum: "$speed"
              },
              "unit": 'number'
            },
          }
        },
        "exercises": {
          $addToSet: {
            name: "$name",
            _id: "$exerciseId"
          }
        },
      }
    },
    {
      $project: {
        _id: 0,
        subCategory: "$_id",
        exerciseId: condition["exerciseId"],
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
      var speedUnit = distanceUnit === "km" ? "kmph" : "mph";
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
      let restTime = _.pluck(_.pluck(w.fields, "restTime"), "total");
      let speed = _.pluck(_.pluck(w.fields, "speed"), "total");

      let totalTime = await time.reduce(getSum);
      let totalDistance = await distance.reduce(getSum);
      let totalEffort = await effort.reduce(getSum);
      let totalWeight = await weight.reduce(getSum);
      let totalRepTime = await repTime.reduce(getSum);
      let totalSetTime = await setTime.reduce(getSum);
      let totalReps = await reps.reduce(getSum);
      let totalSets = await sets.reduce(getSum);
      let totalRestTime = await restTime.reduce(getSum);
      let totalSpeed = await speed.reduce(getSum);

      w.fields = {};
      var formatStringForTime = "h.m [hrs]";
      var formatStringForRepTime = "h.m [hrs]";
      var formatStringForSetTime = "h.m [hrs]";
      var formatStringForRestTime = "h.m [hrs]";
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
      if (totalRestTime < 60) {
        formatStringForRestTime = "s [sec]";
      } else if (totalRestTime < 3600) {
        formatStringForRestTime = "m [min]";
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
        unit: ""
      }
      w.fields.reps = {
        total: Math.round(totalReps),
        unit: ""
      }
      w.fields.sets = {
        total: Math.round(totalSets),
        unit: ""
      }
      w.fields.restTime = {
        total: moment.duration(totalRestTime, "seconds").format(formatStringForRestTime),
        unit: ""
      }
      w.fields.speed = {
        total: Math.round(await common_helper.convertUnits("kmph", speedUnit, totalSpeed)),
        unit: speedUnit
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



//below functions are extra
/*
 * get_strength_single_graph_data is used to fetch all user single strength graph data
 * @return  status 0 - If any internal error occured while fetching strength data, with error
 *          status 1 - If strength data found, with strength object
 *          status 2 - If strength not found, with appropriate message
 */
statistics_helper.get_strength_single_graph_data = async (condition = {}) => {
  try {
    var user_workouts = await WorkoutLogs.aggregate([{
      $match: condition
    },
    {
      $group: {
        _id: "$subType",
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
            "restTime": {
              "total": {
                $sum: "$restTime"
              },
              "unit": 'second'
            },
            "speed": {
              "total": {
                $sum: "$speed"
              },
              "unit": 'kmph'
            },
          }
        },
        "exercises": {
          $addToSet: {
            name: "$name",
            _id: "$exerciseId"
          }
        },
      }
    },
    {
      $project: {
        _id: 0,
        subCategory: "$_id",
        exerciseId: condition["exerciseId"],
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
      var speedUnit = distanceUnit === "km" ? "kmph" : "mph";
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
      let restTime = _.pluck(_.pluck(w.fields, "restTime"), "total");
      let speed = _.pluck(_.pluck(w.fields, "speed"), "total");

      let totalTime = await time.reduce(getSum);
      let totalDistance = await distance.reduce(getSum);
      let totalEffort = await effort.reduce(getSum);
      let totalWeight = await weight.reduce(getSum);
      let totalRepTime = await repTime.reduce(getSum);
      let totalSetTime = await setTime.reduce(getSum);
      let totalReps = await reps.reduce(getSum);
      let totalSets = await sets.reduce(getSum);
      let totalRestTime = await restTime.reduce(getSum);
      let totalSpeed = await speed.reduce(getSum);

      w.fields = {};
      var formatStringForTime = "h.m [hrs]";
      var formatStringForRepTime = "h.m [hrs]";
      var formatStringForSetTime = "h.m [hrs]";
      var formatStringForRestTime = "h.m [hrs]";
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
      if (totalRestTime < 60) {
        formatStringForRestTime = "s [sec]";
      } else if (totalRestTime < 3600) {
        formatStringForRestTime = "m [min]";
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
        unit: ""
      }
      w.fields.reps = {
        total: Math.round(totalReps),
        unit: ""
      }
      w.fields.sets = {
        total: Math.round(totalSets),
        unit: ""
      }
      w.fields.restTime = {
        total: moment.duration(totalRestTime, "seconds").format(formatStringForRestTime),
        unit: ""
      }
      w.fields.speed = {
        total: Math.round(await common_helper.convertUnits("kmph", speedUnit, totalSpeed)),
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
 * get_graph_data is used to fetch all user all strength graph data 
 * @return  status 0 - If any internal error occured while fetching strength data, with error
 *          status 1 - If strength data found, with strength object
 *          status 2 - If strength not found, with appropriate message
 */
statistics_helper.get_graph_data = async (condition = {}, activeField) => {
  try {
    var user_workouts = await WorkoutLogs.aggregate([{
      $match: condition
    },
    {
      $sort: {
        logDate: 1
      }
    },
    {
      $group: {
        _id: "$subType",
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
            "restTime": {
              "total": {
                $sum: "$restTime"
              },
              "unit": 'second',
              "date": "$logDate"
            },
            "speed": {
              "total": {
                $sum: "$speed"
              },
              "unit": 'number',
              "date": "$logDate"
            },
          }
        },
        "exercises": {
          $addToSet: {
            name: "$name",
            _id: "$exerciseId"
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
      var speedUnit = distanceUnit === "km" ? "kmph" : "mph";
    }
    var graphData = [];
    for (let w of user_workouts) {
      for (let field of w.fields) {
        var tmp = {
          metaData: {
            name: activeField,
          },
          date: field[activeField].date,
          dateToCompare: moment(field[activeField].date).format("DD/MM/YYYY"),

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
        } else if (activeField === "restTime") {
          tmp.count = parseFloat((await common_helper.convertUnits("second", "minute", field[activeField].total)).toFixed(2))
          tmp.metaData.unit = "minute";
        } else if (activeField === "speed") {
          tmp.count = parseFloat((await common_helper.convertUnits("kmph", speedUnit, field[activeField].total)).toFixed(2))
          tmp.metaData.unit = speedUnit;
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
module.exports = statistics_helper;