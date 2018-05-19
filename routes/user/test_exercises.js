var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");
var jwtDecode = require("jwt-decode");
var router = express.Router();

var config = require("../../config");
var constant = require("../../constant");
var logger = config.logger;

var test_exercise_helper = require("../../helpers/test_exercise_helper");
var user_test_exercies_helper = require("../../helpers/user_test_exercies_helper");

/**
 * @api {get} /user/test_exercise Get all
 * @apiName Get all
 * @apiGroup  User Test Exercises
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} test_exercises Array of test_exercises document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  logger.trace("Get all test_exercises API called");
  var resp_data = await test_exercise_helper.get_all_test_exercises();
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching  test_exercises = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    var resp_data2 = await user_test_exercies_helper.get_user_test_exercies_by_user_id(
      { userId: authUserId }
    );
    console.log(resp_data);
    console.log(resp_data2);
    if (resp_data2.status == 1) {
      resp_data.user_test_exercises = resp_data2.user_test_exercises;
    }
    logger.trace("test exercies got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {get} /user/test_exercise Get all
 * @apiName Get all
 * @apiGroup  User Test Exercises
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} test_exercises Array of test_exercises document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  logger.trace("Get all test_exercises API called");
  var resp_data = await test_exercise_helper.get_all_test_exercises();
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching  test_exercises = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("test exercies got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /user/test_exercise Save exercise Preference
 * @apiName Save
 * @apiGroup User Test Exercise
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization user's unique access-key
 * @apiParamExample {JSON} Request-Example:
 {
	"user_test_exercises":{
  < test exercise id >: {
    "format": < format of test exercise >,
    "value": < value of test exercise >
  },
  < test exercise id >: {
    "format": < format of test exercise >,
    "value": < value of test exercise >
  },
  < test exercise id >: {
    "format": < format of test exercise >,
    "value": < value of test exercise >
  },
  < test exercise id >: {
    "format": < format of test exercise >,
    "value": < value of test exercise >
  }
}
}
 * @apiSuccess (Success 200) {JSON} user_test_exercies  user_test_exercies  details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var test_exercise_array = [];
  var temp=req.body.user_test_exercises;

  Object.keys(temp).forEach(function(key) {
    var val = temp[key];
    test_exercise_array.push({
      userId:authUserId,
      format:val.format,
      test_exercise_id:key,
      [val.format]:val.value
    })
   
  });
  // console.log('DATA',test_exercise_array);
  

  var resp_data = await user_test_exercies_helper.delete_user_test_exercies({
    userId: authUserId
  });

  if (resp_data.status == 1) {
    let test_exercise_data = await user_test_exercies_helper.insert_user_test_exercies(
      test_exercise_array
    );
    if (test_exercise_data.status === 0) {
      logger.error(
        "Error while inserting user test exercies = ",
        test_exercise_data
      );
      res.status(config.BAD_REQUEST).json({ test_exercise_data });
    } else {
      res.status(config.OK_STATUS).json(test_exercise_data);
    }
  } else {
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  }
});

/**
 * @api {delete} /user/test_exercise Delete Test Exercise
 * @apiName  Test Exercise
 * @apiGroup User Test Exercise
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {JSON} message  message of delete
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  logger.trace("delete exercise preference API called : ", authUserId);
  let test_exercise_data = await user_test_exercies_helper.delete_user_test_exercies(
    {
      userId: authUserId
    }
  );
  if (test_exercise_data.status === 1) {
    test_exercise_data.message = "delete Exercise preference";
    res.status(config.OK_STATUS).json(test_exercise_data);
  } else {
    logger.error(
      "Error while deleting user test exercies = ",
      test_exercise_data
    );
    // test_exercise_data.message="could not reset exercise preference";

    res.status(config.BAD_REQUEST).json({ test_exercise_data });
  }
});

module.exports = router;