var express = require("express");
var router = express.Router();
var config = require("../../config");
var logger = config.logger;
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

  var totalUsers = await user_helper.count_users();
  if (totalUsers.status === 1) {
    returnObject.totalUsers = totalUsers.count;
  }

  var totalExercises = await exercise_helper.count_exercises();
  if (totalExercises.status === 1) {
    returnObject.totalExercises = totalExercises.count;
  }

  var totalFitnessTest = await test_exercise_helper.count_test_exercises();
  if (totalFitnessTest.status === 1) {
    returnObject.totalFitnessTest = totalFitnessTest.count;
  }

  var totalProgram = await user_program_helper.count_total_programs();
  if (totalProgram.status === 1) {
    returnObject.totalProgram = totalProgram.count;
  }

  var completedExercises = await user_workouts_helper.count_all_workouts({
    isCompleted: 1
  });
  if (completedExercises.status === 1) {
    returnObject.completedExercises = completedExercises.count;
  }

  return res.status(config.OK_STATUS).send(returnObject)
});


module.exports = router;