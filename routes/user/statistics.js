var express = require("express");
var router = express.Router();
var config = require("../../config");
var jwtDecode = require("jwt-decode");
var logger = config.logger;

var statistics_helper = require("../../helpers/statistics_helper");

/**
 * @api {get} /user/statistics/:type Get
 * @apiName Get
 * @apiGroup User Statistics
 * @apiDescription <font color=red>Type can be strength, cardio</font>
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {JSON} stats JSON of statistics's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:type", async (req, res) => {
  logger.trace("User Statistics API called with " + type + " type");

  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var type = req.params.type;
  var resp_data;
  if (type && type != null) {
    if (type == "strength") {
      // weight_lifted_total,weight_lifted_average,workouts_total,reps_total,sets_total, workout_time
      resp_data = await statistics_helper.get_strength({
        userId: authUserId,
        isCompleted: 1
      });
    } else if (type == "cardio") {
      // total_distance run, total time running,total elevation, peak heartrate, distance cycled, total steps
      resp_data = await statistics_helper.get_cardio({
        userId: authUserId,
        isCompleted: 1
      });
    }
    console.log('------------------------------------');
    console.log('resp_data : ', resp_data);
    console.log('------------------------------------');

    if (resp_data.status == 1) {
      logger.trace("Get user statistics data successfully   = ", resp_data);
      res.status(config.OK_STATUS).json(resp_data);
    } else {
      logger.error(
        "Error occured while fetching user statistics data = ",
        resp_data
      );
      res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    }
  } else {
    logger.error("NO type provided for statistics");
    res.status(config.OK_STATUS).json({
      status: 0,
      message: "please provide type"
    });
  }
});

module.exports = router;