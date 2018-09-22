var express = require("express");
var jwtDecode = require("jwt-decode");
var router = express.Router();
var config = require("../../config");
var logger = config.logger;
var exercise_measurements_helper = require("../../helpers/exercise_measurements_helper");

/**
 * @api {get} /user/exercise_measurements Get All measurements
 * @apiName  Get All measurements
 * @apiGroup  Workout Exercise Measurements
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {Array} measurements Array of exercise_measurements document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  var resp_data = await exercise_measurements_helper.get_all_measurements({});

  if (resp_data.status == 0) {
    logger.error(
      "Error occured while fetching Exercise measurements = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("Exercise measurements got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /user/exercise_measurements Add Exercise measurements
 * @apiName Add Exercise measurements
 * @apiGroup  Workout Exercise Measurements
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} workoutType workoutType of exercise measurements
 * @apiParam {String} time time of exercise measurements
 * @apiParam {String} disatance disatance of exercise measurements
 * @apiParam {String} reps reps of exercise measurements
 * @apiParam {String} evalation evalation of exercise measurements
 * @apiParam {String} timeUnit timeUnit of exercise measurements
 * @apiParam {String} disatanceUnit disatanceUnit of exercise measurements
 * @apiParam {String} evalationUnit evalationUnit of exercise measurements
 * @apiSuccess (Success 200) {JSON} measurement Added exercise_measurements details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var exercise_measurements_obj = req.body.data;
  // var exercise_measurements_obj = {
  //   workoutType: req.body.workoutType,
  //   time: req.body.time,
  //   disatance: req.body.disatance,
  //   reps: req.body.reps,
  //   evalation: req.body.evalation,
  //   timeUnit: req.body.timeUnit,
  //   disatanceUnit: req.body.disatanceUnit,
  //   evalationUnit: req.body.evalationUnit
  // };

  let resp_data = await exercise_measurements_helper.insert_exercise_measurements(
    exercise_measurements_obj
  );
  if (resp_data.status === 1) {
    return res.status(config.OK_STATUS).json(resp_data);
  } else {
    logger.error("Error while inserting exercise_measurements = ", resp_data);
    return res.status(config.BAD_REQUEST).json({
      resp_data
    });
  }
});

module.exports = router;