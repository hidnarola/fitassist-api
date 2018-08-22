var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var config = require("../../config");
var constant = require("../../constant");
var logger = config.logger;
var jwtDecode = require("jwt-decode");
var request = require("request-promise");
var async = require("async");
var jwtDecode = require("jwt-decode");
var moment = require("moment");
var user_calendar_helper = require("../../helpers/user_calendar_helper");

/**
 * @api {post} /user/user_calendar Get User Calendar
 * @apiName Get User Calendar
 * @apiGroup User Calendar
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {JSON} user_calendar
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
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

  logger.trace("Get all calendar API called : ");
  var resp_data = await user_calendar_helper.get_calendar({
    date: {
      $gte: new Date(startdate),
      $lte: new Date(enddate)
    },
    userId: authUserId
  });

  if (resp_data.status == 0) {
    logger.error(
      "Error occured while fetching all user's calendar = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /user/user_calendar/by_month Get User Calendar
 * @apiName Get User Calendar
 * @apiGroup User Calendar
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {JSON} user_calendar
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/by_month", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var date = req.body.date;
  var check = await moment(date).utc(0);
  var startdate = await moment(check).subtract(2, "month");
  var enddate = await moment(check).add(2, "month");

  logger.trace("Get all calendar by month API called : ");

  var resp_data = await user_calendar_helper.get_calendar({
    date: {
      $gte: new Date(startdate),
      $lte: new Date(enddate)
    },
    userId: authUserId
  });

  if (resp_data.status == 0) {
    logger.error(
      "Error occured while fetching all user's calendar by month = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {put} /user/user_calendar/ Complete Workout
 * @apiName Complete Workout
 * @apiGroup User Calendar
 * @apiHeader {String}  authorization user's unique access-key
 * @apiParam {Date}  date date of Workout
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/", async (req, res) => {
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

  logger.trace("complete user's Workout API");
  let user_workout_data = await user_calendar_helper.complete_workouts({
    date: {
      $gte: startdate,
      $lte: enddate
    },
    userId: authUserId
  }, {
    isCompleted: 1
  });

  if (user_workout_data.status === 1) {
    res.status(config.OK_STATUS).json(user_workout_data);
  } else {
    res.status(config.INTERNAL_SERVER_ERROR).json(user_workout_data);
  }
});

module.exports = router;