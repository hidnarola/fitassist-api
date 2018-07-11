var express = require("express");
var router = express.Router();
var config = require("../../config");
var jwtDecode = require("jwt-decode");

var logger = config.logger;

var user_leaderboard_helper = require("../../helpers/user_leaderboard_helper");

/**
 * @api {get} /user/user_leaderboard/:type Get
 * @apiName Get
 * @apiGroup User Leaderboard
 * @apiDescription <font color=red>Type can be strength, cardio, nutrition, body</font>
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {JSON} goals JSON of badges_assign's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:type", async (req, res) => {
  logger.trace("User Leaderboard API called with " + type + " type");

  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var type = req.params.type;
  var resp_data;
  if (type && type != null) {
    if (type == "strength") {
      // weight_lifted_total,weight_lifted_average,workouts_total,reps_total,sets_total, workout_time
      resp_data = await user_leaderboard_helper.get_strength({
        userId: authUserId
      });
    } else if (type == "cardio") {
      // total_distance run, total time running,total elevation, peak heartrate, distance cycled, total steps
      resp_data = await user_leaderboard_helper.get_cardio({
        userId: authUserId
      });
    } else if (type == "nutrition") {
      // total calories, avg protain, total fat, total excess cals, total cabs, monthly protain
      resp_data = await user_leaderboard_helper.get_nutrition({
        userId: authUserId
      });
    } else if (type == "body") {
      // body fat change, shoulder waist ration, current weight, resting heart rate, bicep growth, weight change
      resp_data = await user_leaderboard_helper.get_body({
        userId: authUserId
      });
    }

    if (resp_data.status == 1) {
      logger.trace("Get user leaderboard data successfully   = ", resp_data);
      res.status(config.OK_STATUS).json(resp_data);
    } else {
      logger.error(
        "Error occured while fetching user leaderboard data = ",
        resp_data
      );
      res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    }
  } else {
    logger.error("NO type provide for leaderboard");
    res.status(config.OK_STATUS).json({
      status: 0,
      message: "please provide type"
    });
  }
});

module.exports = router;
