var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");
var moment = require("moment");
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
 * @apiHeader {String}  authorization Admin's unique access-key
 * @apiSuccess (Success 200) {Array} test_exercises Array of test_exercises document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/today", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var date = req.body.date;

  var start = moment(date).utcOffset(0);
  start.toISOString();
  start.format();

  var end = moment(date)
    .utcOffset(0)
    .add(23, "hours")
    .add(59, "minutes");
  end.toISOString();
  end.format();

  logger.trace("Get all test exercises API called");
  var resp_exercise_all_test = await test_exercise_helper.get_all_test_exercises_list(
    {
      $and: [
        {
          isDeleted: 0
        },
        {
          status: 1
        }
      ]
    }
  );
  console.log("resp_exercise_all_test", resp_exercise_all_test);
  if (resp_exercise_all_test.status === 0) {
    logger.error(
      "Error occured while fetching  test exercises = ",
      resp_exercise_all_test
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_exercise_all_test);
  } else {
    var resp_data = await test_exercise_helper.get_all_test_exercises({
      $and: [
        {
          isDeleted: 0
        },
        {
          status: 1
        }
      ]
    });

    if (resp_data.status == 0) {
      logger.error(
        "Error occured while fetching  test exercises = ",
        resp_data
      );
      res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    } else {
      var resp_data2 = await user_test_exercies_helper.get_user_test_exercies_by_user_id(
        {
          userId: authUserId,
          createdAt: {
            $gte: start,
            $lte: end
          }
        }
      );
      if (resp_exercise_all_test.status === 1) {
        resp_data.all_test = resp_exercise_all_test.all_test;
      }
      if (resp_data2.status === 1) {
        resp_data.user_test_exercises = resp_data2.user_test_exercises;
      }
      if (resp_data.status === 1) {
        logger.trace("test exercies got successfully = ", resp_data);
        res.status(config.OK_STATUS).json(resp_data);
      } else {
        logger.trace("test exercies failed to find = ", resp_data);
        res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
      }
    }
  }
});

router.post("/logdates", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var date = req.body.date;

  var start = moment(date)
    .utcOffset(0)
    .subtract(2, "month")
    .startOf("day");
  start.toISOString();
  start.format();

  var end = moment(date)
    .utcOffset(0)
    .endOf("day")
    .add(2, "month");
  end.toISOString();
  end.format();

  console.log("START", start);
  console.log("END", end);

  var searchObj = {
    modifiedAt: {
      $gte: new Date(start),
      $lte: new Date(end)
    },
    userId: authUserId
  };

  var resp_data = await user_test_exercies_helper.get_user_test_exercies_by_user_id_logDates(
    searchObj
  );
  console.log(resp_data);
  if (resp_data.status === 1) {
    logger.trace("test exercies got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  } else {
    logger.trace("test exercies failed to find = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  }
});

/**
 * @api {post} /user/test_exercise Save exercise Preference
 * @apiName Save
 * @apiGroup User Test Exercise
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization user's unique access-key
 * @apiParamExample {JSON} Request-Example:
 * {
 * "user_test_exercises":{
 * < test exercise id >: {
 *  "format": < format of test exercise >,
 *  "value": < value of test exercise >
 * },
 * < test exercise id >: {
 *  "format": < format of test exercise >,
 * "value": < value of test exercise >
 * },
 * < test exercise id >: {
 *  "format": < format of test exercise >,
 *  "value": < value of test exercise >
 * },
 * test exercise id >: {
 * "format": < format of test exercise >,
 *  "value": < value of test exercise >
 * }
 * }
 * }
 * @apiSuccess (Success 200) {JSON} user_test_exercies  user_test_exercies  details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var test_exercise_array = [];
  var temp = req.body.user_test_exercises;
  var createdAt = req.body.date;

  Object.keys(temp).forEach(function(key) {
    var val = temp[key];
    test_exercise_array.push({
      userId: authUserId,
      format: val.format,
      test_exercise_id: key,
      [val.format]: val.value,
      createdAt,
      modifiedAt: createdAt
    });
  });

  let test_exercise_data = await user_test_exercies_helper.insert_user_test_exercies(
    test_exercise_array,
    createdAt,
    authUserId
  );

  if (test_exercise_data.status === 1) {
    res.status(config.OK_STATUS).json(test_exercise_data);
  } else {
    logger.error(
      "Error while inserting user test exercies = ",
      test_exercise_data
    );
    res.status(config.BAD_REQUEST).json({
      test_exercise_data
    });
  }
});

/**
 * @api {delete} /user/test_exercise/reset Delete Test Exercise
 * @apiName  Test Exercise
 * @apiGroup User Test Exercise
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {JSON} message  message of delete
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/reset", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var date = req.body.date;

  var start = moment(date).utcOffset(0);
  start.toISOString();
  start.format();

  var end = moment(date)
    .utcOffset(0)
    .add(23, "hours")
    .add(59, "minutes");
  end.toISOString();
  end.format();
  logger.trace("reset user test exercies API called : ", authUserId);
  let test_exercise_data = await user_test_exercies_helper.delete_user_test_exercies(
    {
      userId: authUserId,
      createdAt: {
        $gte: start,
        $lte: end
      }
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

    res.status(config.BAD_REQUEST).json({
      test_exercise_data
    });
  }
});

/**
 *@apiIgnore not implemented
 * @api {get} /user/test_exercise/all Get all
 * @apiName Get all
 * @apiGroup  User Test Exercises
 * @apiHeader {String}  authorization Admin's unique access-key
 * @apiSuccess (Success 200) {Array} test_exercises Array of test_exercises document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
/** router.get("/all", async (req, res) => {
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
});*/
module.exports = router;
