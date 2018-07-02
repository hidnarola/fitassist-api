var express = require("express");
var router = express.Router();

var config = require("../../config");
var jwtDecode = require("jwt-decode");
var moment = require("moment");
var logger = config.logger;

var user_workout_helper = require("../../helpers/user_workout_helper.bkup");

/**
 * @api {get} /user/workout/:workout_id Get user's workout by _id
 * @apiName Get user's workout by _id
 * @apiGroup  User Workout
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {JSON} user_workout JSON of user_workout document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:workout_id", async (req, res) => {
  var workout_id = req.params.workout_id;

  logger.trace("Get all user workout  API called ID:" + workout_id);
  var resp_data = await user_workout_helper.get_user_workout_by_id({
    _id: workout_id
  });

  if (resp_data.status == 0) {
    logger.error("Error occured while fetching user workout = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user workout got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /user/workout Get all user's workout
 * @apiName Get all user's workout
 * @apiGroup  User Workout
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {JSON} user_workouts JSON of user_workout document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var date = req.body.date;

  // var start = moment(date).startOf("day"); // set to 12:00 am today
  // var end = moment(date).endOf("day"); // set to 23:59 pm today

  var start = moment(date).utcOffset(0);
  start.toISOString();
  start.format();

  var end = moment(date)
    .utcOffset(0)
    .add(23, "hours")
    .add(59, "minutes");
  end.toISOString();
  end.format();

  logger.trace("Get all user workouts  API called");
  var resp_data = await user_workout_helper.get_user_workout({
    userId: authUserId,
    date: {
      $gte: start,
      $lte: end
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
 * @api {delete} /user/workout/:workout_id Delete user's workout by _id
 * @apiName Delete user's workout by _id
 * @apiGroup  User Workout
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {JSON} user_workout JSON of user_workout document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:workout_id", async (req, res) => {
  var workout_id = req.params.workout_id;

  logger.trace("Delete user workout  API called ID:" + workout_id);
  var resp_data = await user_workout_helper.delete_user_workout({
    _id: workout_id
  });

  if (resp_data.status == 0) {
    logger.error("Error occured while deleting user workout = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user workout got delete successgully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});
module.exports = router;
