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
  var last2StepData;
  var tmp;
  var perChange;
  var current = await moment(req.body.end).endOf('day').utc(0);
  var start = await moment(req.body.start).startOf('day').utc(0);
  var days = current.diff(start, 'days');
  var previousStart = await moment(start).subtract(days, "day");
  var totalUsers = await user_helper.count_users({
    createdAt: {
      $gte: start,
      $lte: current
    }
  });

  last2StepData = await user_helper.count_users({
    createdAt: {
      $gte: previousStart,
      $lte: start
    }
  });

  tmp = (totalUsers.count - last2StepData.count);
  perChange = parseFloat(((tmp / totalUsers.count) * 100).toFixed(2));

  if (totalUsers.status === 1) {
    returnObject.totalUsers = {
      total: totalUsers.count,
      perChange,
      days
    };
  }

  var totalExercises = await exercise_helper.count_exercises({
    createdAt: {
      $gte: start,
      $lte: current
    }
  });
  last2StepData = await exercise_helper.count_exercises({
    createdAt: {
      $gte: previousStart,
      $lte: start
    }
  });

  tmp = (totalExercises.count - last2StepData.count);
  perChange = parseFloat(((tmp / totalExercises.count) * 100).toFixed(2));
  if (totalExercises.status === 1) {
    returnObject.totalExercises = {
      total: totalExercises.count,
      perChange,
      days
    };
  }

  var totalFitnessTest = await test_exercise_helper.count_test_exercises({
    createdAt: {
      $gte: start,
      $lte: current
    }
  });

  last2StepData = await test_exercise_helper.count_test_exercises({
    createdAt: {
      $gte: previousStart,
      $lte: start
    }
  });

  tmp = (totalFitnessTest.count - last2StepData.count);
  perChange = parseFloat(((tmp / totalFitnessTest.count) * 100).toFixed(2));
  if (totalFitnessTest.status === 1) {
    returnObject.totalFitnessTest = {
      total: totalFitnessTest.count,
      perChange,
      days
    };
  }

  var totalProgram = await user_program_helper.count_total_programs({
    createdAt: {
      $gte: start,
      $lte: current
    }
  });
  last2StepData = await user_program_helper.count_total_programs({
    createdAt: {
      $gte: previousStart,
      $lte: start
    }
  });

  tmp = (totalProgram.count - last2StepData.count);
  perChange = parseFloat(((tmp / totalProgram.count) * 100).toFixed(2));
  if (totalProgram.status === 1) {
    returnObject.totalProgram = {
      total: totalProgram.count,
      perChange,
      days
    };
  }

  var completedExercises = await user_workouts_helper.count_all_workouts({
    createdAt: {
      $gte: start,
      $lte: current
    },
    isCompleted: 1
  });

  last2StepData = await user_workouts_helper.count_all_workouts({
    createdAt: {
      $gte: previousStart,
      $lte: start
    },
    isCompleted: 1
  });

  tmp = (completedExercises.count - last2StepData.count);
  perChange = parseFloat(((tmp / completedExercises.count) * 100).toFixed(2));

  if (completedExercises.status === 1) {
    returnObject.completedExercises = {
      total: completedExercises.count,
      perChange,
      days
    };
  }
  return res.status(config.OK_STATUS).send({
    status: 1,
    message: "Dashboard record found",
    data: returnObject
  });

});


module.exports = router;