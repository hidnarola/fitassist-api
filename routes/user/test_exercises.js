var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");
var jwtDecode = require("jwt-decode");
var router = express.Router();

var config = require("../../config");
var logger = config.logger;

var test_exercise_helper = require("../../helpers/test_exercise_helper");



/**
 * @api {get} /admin/test_exercise Get all
 * @apiName Get all
 * @apiGroup  Test Exercises
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} test_exercises Array of test_exercises document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {

  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  logger.trace("Get all test_exercises API called");
  var resp_data = await test_exercise_helper.get_test_exercises();
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching  test_exercises = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("test exercies got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});




module.exports = router;
