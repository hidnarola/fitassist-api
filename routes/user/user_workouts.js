var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");
var jwtDecode = require("jwt-decode");

var router = express.Router();
var mongoose = require("mongoose");
var moment = require("moment");
var _ = require("underscore");
var constant = require("../../constant");

var config = require("../../config");
var logger = config.logger;

var user_workout_helper = require("../../helpers/user_workouts_helper");
var exercise_helper = require("../../helpers/exercise_helper");
var common_helper = require("../../helpers/common_helper");
var badge_assign_helper = require("../../helpers/badge_assign_helper");
var socket = require("../../socket/socketServer");

/**
 * @api {post} /user/user_workouts/ Get User Workouts
 * @apiName Get User Workouts
 * @apiGroup  User Workouts
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {Date}  date Date of user's workout program
 * @apiSuccess (Success 200) {JSON} workouts JSON of user_workouts
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/get_by_month", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var date = req.body.date;
  var check = await moment(date).utc(0);
  var startCheck = await moment(check).subtract(2, "month");
  var endCheck = await moment(check).add(2, "month");
  var resp_data = await user_workout_helper.get_all_workouts({
    userId: authUserId,
    date: {
      $gte: new Date(startCheck),
      $lt: new Date(endCheck)
    }
  });

  if (resp_data.status == 0) {
    logger.error("Error occured while fetching user workouts = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user workouts got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /user/user_workouts Add User Workouts
 * @apiName Add User Workouts
 * @apiGroup  User Workouts
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} title title of workout
 * @apiParam {String} description description of workout
 * @apiParam {Enum} type type of workout | Possbile value <code>Enum: ["exercise","restday"]</code>
 * @apiParam {Date} date date of workout
 * @apiParam {Array} exercises list of exercises of workout
 * @apiSuccess (Success 200) {JSON} workout workout details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var masterCollectionObject = {
    title: req.body.title,
    description: req.body.description,
    type: req.body.type,
    userId: authUserId,
    date: req.body.date
  };
  var exercises = [];
  if (req.body.type != "restday") {
    exercises = req.body.exercises;
    var exercise_ids = _.pluck(exercises, "exerciseId");

    exercise_ids.forEach((id, index) => {
      exercise_ids[index] = mongoose.Types.ObjectId(id);
    });

    var exercise_data = await exercise_helper.get_exercise_id(
      {
        _id: { $in: exercise_ids }
      },
      1
    );
    var tmp = 0;
    exercises = exercises.map(async ex => {
      ex.exercise = _.find(exercise_data.exercise, exercise => {
        return exercise._id.toString() === ex.exerciseId.toString();
      });
      delete ex.exerciseId;
      if (ex.weight) {
        var baseWeight = await common_helper.unit_converter(
          ex.weight,
          ex.weightUnits
        );
        ex.baseWeightUnits = baseWeight.baseUnit;
        ex.baseWeightValue = baseWeight.baseValue;
      }

      if (ex.distance) {
        var baseDistance = await common_helper.unit_converter(
          ex.distance,
          ex.distanceUnits
        );
        ex.baseDistanceUnits = baseDistance.baseUnit;
        ex.baseDistanceValue = baseDistance.baseValue;
      }
      ex.date = req.body.date;
      return ex;
    });
    exercises = await Promise.all(exercises);
  }

  var workout_data = await user_workout_helper.insert_user_workouts(
    masterCollectionObject,
    exercises
  );

  if (workout_data.status == 1) {
    res.status(config.OK_STATUS).json(workout_data);
  } else {
    res.status(config.BAD_REQUEST).json(workout_data);
  }
});

/**
 * @api {put} /user/user_workouts/complete Complete User workout
 * @apiName Complete User workout
 * @apiGroup  User Workouts
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {Date} date Date of Workout to be complete
 * @apiSuccess (Success 200) {String} Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/complete", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var date = req.body.date;

  var startdate = moment(date).utcOffset(0);
  startdate.toISOString();
  startdate.format();

  var enddate = moment(date)
    .utcOffset(0)
    .add(23, "hours")
    .add(59, "minutes");
  enddate.toISOString();
  enddate.format();

  logger.trace("Complete workout API Called");
  let workout_data = await user_workout_helper.complete_workout({
    date: {
      $gte: startdate,
      $lte: enddate
    }
  });

  if (workout_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(workout_data);
  } else {
    let workout_detail = await user_workout_helper.workout_detail_for_badges({
      userId: authUserId
    });
    delete workout_detail.workouts._id;

    //badge assign start;
    var badges = await badge_assign_helper.badge_assign(
      authUserId,
      constant.BADGES_TYPE.WORKOUTS.concat(constant.BADGES_TYPE.WEIGHT_LIFTED),
      workout_detail.workouts
    );
    //badge assign end

    res.status(config.OK_STATUS).json(workout_data);
  }
});

/**
 * @api {put} /user/user_workouts/:workout_id  Update User Workouts
 * @apiName Update User Workouts
 * @apiGroup  User Workouts
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {JSON} friend approved friend detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:workout_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var masterCollectionObject = {
    title: req.body.title,
    description: req.body.description,
    type: req.body.type,
    userId: authUserId,
    date: req.body.date
  };
  var exercises = [];
  if (req.body.type != "restday") {
    exercises = req.body.exercises;
    var exercise_ids = _.pluck(exercises, "exerciseId");

    exercise_ids.forEach((id, index) => {
      exercise_ids[index] = mongoose.Types.ObjectId(id);
    });

    var exercise_data = await exercise_helper.get_exercise_id(
      {
        _id: { $in: exercise_ids }
      },
      1
    );
    var tmp = 0;
    exercises = exercises.map(async ex => {
      ex.exercise = _.find(exercise_data.exercise, exercise => {
        return exercise._id.toString() === ex.exerciseId.toString();
      });
      delete ex.exerciseId;
      if (ex.weight) {
        var baseWeight = await common_helper.unit_converter(
          ex.weight,
          ex.weightUnits
        );
        ex.baseWeightUnits = baseWeight.baseUnit;
        ex.baseWeightValue = baseWeight.baseValue;
      }

      if (ex.distance) {
        var baseDistance = await common_helper.unit_converter(
          ex.distance,
          ex.distanceUnits
        );
        ex.baseDistanceUnits = baseDistance.baseUnit;
        ex.baseDistanceValue = baseDistance.baseValue;
      }
      ex.date = req.body.date;
      return ex;
    });
    exercises = await Promise.all(exercises);
  }

  var workout_data = await user_workout_helper.update_user_workouts_by_id(
    req.params.workout_id,
    masterCollectionObject,
    exercises
  );

  if (workout_data.status == 1) {
    res.status(config.OK_STATUS).json(workout_data);
  } else {
    res.status(config.BAD_REQUEST).json(workout_data);
  }
});

/**
 * @api {delete} /user/user_workouts/:workout_id Delete User workout
 * @apiName Delete User workout
 * @apiGroup  User Workouts
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {String} Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:workout_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  logger.trace("Delete workout API - Id = ", req.params.workout_id);
  let workout_data = await user_workout_helper.delete_user_workouts_by_id(
    req.params.workout_id
  );

  if (workout_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(workout_data);
  } else {
    res.status(config.OK_STATUS).json(workout_data);
  }
});

module.exports = router;
