var express = require("express");
var router = express.Router();
var config = require("../../config");
var jwtDecode = require("jwt-decode");
var moment = require("moment");
var logger = config.logger;

var workout_progress_helper = require("../../helpers/workout_progress_helper");
var measurement_helper = require("../../helpers/measurement_helper");

/**
 * @api {post} /user/workout_progress Get Progress Detail by Date and type
 * @apiName Get Progress Detail by Date and type
 * @apiGroup User Workout Progress
 * @apiHeader {String}  authorization user's unique access-key
 * @apiHeader {String}  start start date of progress
 * @apiHeader {String}  end end date of progress
 * @apiHeader {String}  category category of progress |<code> possible values ['mobility','strength',cardio] </code>
 * @apiSuccess (Success 200) {JSON} progress JSON of user_test_exercises 's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  logger.trace("Get all user's progress detail");
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var resp_data = {
    status: 0,
    message: "no record found"
  }
  var schema = {
    start: {
      notEmpty: true,
      errorMessage: "start date is required"
    },
    end: {
      notEmpty: true,
      errorMessage: "end date is required"
    },
    category: {
      notEmpty: true,
      errorMessage: "category is required"
    }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {
    var start = req.body.start;
    var end = req.body.end;
    var start = moment(start).utcOffset(0);
    start.toISOString();
    start.format();

    var end = moment(end).utcOffset(0);
    end.toISOString();
    end.format();

    var category = null;
    if (req.body.category === "mobility") {
      category = ["posture", "flexibility"]
    } else if (req.body.category === "strength") {
      category = [req.body.category]
    } else if (req.body.category === "muscle") {
      category = "muscle"
    }

    if (category === "muscle") {
      resp_data = await workout_progress_helper.user_body_progress({
        userId: authUserId,
        logDate: {
          $gte: new Date(start),
          $lte: new Date(end)
        }
      });
    } else {
      resp_data = await workout_progress_helper.get_progress_detail({
        createdAt: {
          createdAt: {
            $gte: new Date(start),
            $lte: new Date(end)
          },
          userId: authUserId,
        },
        category: category
      });

      var flexibility = await workout_progress_helper.graph_data({
        createdAt: {
          createdAt: {
            $gte: new Date(start),
            $lte: new Date(end)
          }
        },
        userId: authUserId,
      }, "flexibility");
      if (flexibility.status === 1) {
        try {
          resp_data.progress.data.flexibility.graph_data = flexibility.progress
        } catch (error) {}
      }

      var posture = await workout_progress_helper.graph_data({
        createdAt: {
          createdAt: {
            $gte: new Date(start),
            $lte: new Date(end)
          }
        },
        userId: authUserId,
      }, "posture");
      if (posture.status === 1) {
        try {
          resp_data.progress.data.posture.graph_data = posture.progress
        } catch (error) {}
      }
    }
  }


  if (resp_data.status === 1) {
    logger.trace("user progress  got successfully   = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  } else if (resp_data.status === 2) {
    logger.error(
      "no record found = ",
      resp_data
    );
    res.status(config.OK_STATUS).json(resp_data);
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

module.exports = router;