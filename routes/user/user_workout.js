var express = require("express");
var router = express.Router();

var config = require("../../config");
var jwtDecode = require("jwt-decode");
var moment = require("moment");
var logger = config.logger;

var user_workout_helper = require("../../helpers/user_workout_helper");

/**
 * @api {post} /user/workout Get all user's workout
 * @apiName Get all user's workout
 * @apiGroup  User Body Parts
 * @apiHeader {String}  x-access-token User's unique access-key
 * @apiSuccess (Success 200) {JSON} user_workouts JSON of user_workout document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var date = req.body.date;


  var start = moment(date).startOf('day'); // set to 12:00 am today
  var end = moment(date).endOf('day'); // set to 23:59 pm today
  console.log("start", start);
  console.log("end", end);

  logger.trace("Get all user workout  API called");
  var resp_data = await user_workout_helper.get_user_workout({
    userId: authUserId,
    date: {
      $gte: start,
      $lte: end
    }
  });
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching user workout = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user workout got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

module.exports = router;
