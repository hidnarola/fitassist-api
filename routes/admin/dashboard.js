var express = require("express");
var router = express.Router();
var config = require("../../config");
var logger = config.logger;
var moment = require("moment");
var user_helper = require("../../helpers/user_helper");
var exercise_helper = require("../../helpers/exercise_helper");
var user_workouts_helper = require("../../helpers/user_workouts_helper");
var test_exercise_helper = require("../../helpers/test_exercise_helper");
var user_program_helper = require("../../helpers/user_program_helper");


/**
 * @api {post} /admin/dashboard  Dashboard
 * @apiName Dashboard
 * @apiGroup  Dashboard
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {JSON} dashboard dashboard detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  logger.trace('Admin dashboard API called');

  var returnObject = {
    totalUsers: null,
    totalExercises: null,
    totalFitnessTest: null,
    totalProgram: null,
    completedExercises: null,
    totalUsers: null,
    topUsers: null
  };
  var prevData;
  var newData;
  var tmp;
  var current = await moment(req.body.end).endOf('day').utc(0);
  var start = await moment(req.body.start).startOf('day').utc(0);
  var days = current.diff(start, 'days') + 1;
  var previousStart = await moment(start).subtract(days, "day");

  newData = await user_helper.count_users({
    createdAt: {
      $gte: start,
      $lte: current
    }
  });
  prevData = await user_helper.count_users({
    createdAt: {
      $gte: previousStart,
      $lte: start
    }
  });
  returnObject = await perChange(returnObject, "totalUsers", newData, prevData, days);

  var newData = await exercise_helper.count_exercises({
    createdAt: {
      $gte: start,
      $lte: current
    }
  });
  prevData = await exercise_helper.count_exercises({
    createdAt: {
      $gte: previousStart,
      $lte: start
    }
  });

  returnObject = await perChange(returnObject, "totalExercises", newData, prevData, days);

  var newData = await test_exercise_helper.count_test_exercises({
    createdAt: {
      $gte: start,
      $lte: current
    }
  });

  prevData = await test_exercise_helper.count_test_exercises({
    createdAt: {
      $gte: previousStart,
      $lte: start
    }
  });

  returnObject = await perChange(returnObject, "totalFitnessTest", newData, prevData, days);

  var newData = await user_program_helper.count_total_programs({
    createdAt: {
      $gte: start,
      $lte: current
    }
  });
  prevData = await user_program_helper.count_total_programs({
    createdAt: {
      $gte: previousStart,
      $lte: start
    }
  });

  returnObject = await perChange(returnObject, "totalProgram", newData, prevData, days);

  var newData = await user_workouts_helper.count_all_workouts({
    createdAt: {
      $gte: start,
      $lte: current
    },
    isCompleted: 1
  });

  prevData = await user_workouts_helper.count_all_workouts({
    createdAt: {
      $gte: previousStart,
      $lte: start
    },
    isCompleted: 1
  });

  returnObject = await perChange(returnObject, "completedExercises", newData, prevData, days);

  return res.status(config.OK_STATUS).send({
    status: 1,
    message: "Dashboard record found",
    data: returnObject
  });
});

async function perChange(returnObject, key, newData, prevData, days) {
  let tmp = 0;
  var perChange = 0;
  var newOldDiff = (newData.count - prevData.count);
  if (prevData.count <= 0) {
    if (newOldDiff > 0) {
      perChange = 100;
    }
  } else {
    if (newOldDiff > 0) {
      tmp = (newOldDiff / prevData.count) * 100;
    } else if (newOldDiff < 0) {
      tmp = (((prevData.count - newData.count) / prevData.count) * 100) * -1;
    } else {
      perChange = 0;
    }
  }
  if (tmp !== 0) {
    perChange = parseFloat(tmp.toFixed(2));
  }

  returnObject[key] = {
    total: newData.count,
    perChange,
    days
  }
  return returnObject;
}

module.exports = router;