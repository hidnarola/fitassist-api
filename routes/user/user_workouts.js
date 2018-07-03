var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");
var jwtDecode = require("jwt-decode");

var router = express.Router();
var mongoose = require("mongoose");
var moment = require("moment");
var constant = require("../../constant");

var config = require("../../config");
var logger = config.logger;

var user_workout_helper = require("../../helpers/user_workouts_helper");
var exercise_helper = require("../../helpers/exercise_helper");
var socket = require("../../socket/socketServer");

/**
 * @api {post} /user/user_workouts/ Get User Workouts
 * @apiName Get User Workouts
 * @apiGroup  User Workouts
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {Date}  date Date of user's workout program
 * @apiSuccess (Success 200) {JSON} workouts JSON of user_workouts
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/get_by_month", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var date = req.body.date;

  var check = await moment(date).utc(0);
  var startCheck = await moment(check).subtract(1, "month");
  var endCheck = await moment(check).add(1, "month");

  var resp_data = await user_workout_helper.get_all_workouts({
    userId: authUserId,
    date: {
      $gte: new Date(startCheck),
      $lt: new Date(endCheck)
    }
  });

  if (resp_data.status == 0) {
    logger.error("Error occured while fetching user workouts = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user workouts got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /user/user_workouts Add User Workouts
 * @apiName Add User Workouts
 * @apiGroup  User Workouts
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} friendId Id of friend
 * @apiSuccess (Success 200) {JSON} friend request sent in friends detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var schema = {};

  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var masterCollectionObject = {
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      userId: authUserId,
      date: req.body.date
    };

    var exercise_data = await exercise_helper.get_exercise_id({
      _id: mongoose.Types.ObjectId(req.body.exercise_id)
    });

    var childCollectionObject = {
      type: req.body.type,
      exercise: exercise_data.exercise,
      reps: req.body.reps,
      sets: req.body.sets,
      restTime: req.body.restTime,
      oneSetTimer: req.body.oneSetTimer,
      weight: req.body.weight,
      distance: req.body.distance,
      sequence: 1
    };

    var workout_data = await user_workout_helper.insert_user_workouts(
      masterCollectionObject,
      childCollectionObject
    );

    if (workout_data.status == 1) {
      res.status(config.OK_STATUS).json(workout_data);
    } else {
      res.status(config.BAD_REQUEST).json(workout_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({ message: errors });
  }
});

/**
 * @api {put} /user/user_workouts/:workout_id  Update User Workouts
 * @apiName Update User Workouts
 * @apiGroup  User Workouts
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {JSON} friend approved friend detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:workout_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var workout_id = req.params.workout_id;
  var schema = {
    friendId: {
      notEmpty: true,
      errorMessage: "Friend id is required"
    }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    if (authUserId === req.body.friendId) {
      return res
        .status(config.BAD_REQUEST)
        .json({ message: "Can not send friend request yourself" });
    }

    check_workout_data = await user_workout_helper.checkFriend({
      $or: [
        { $and: [{ userId: authUserId }, { friendId: req.body.friendId }] },
        { $and: [{ userId: req.body.friendId }, { friendId: authUserId }] }
      ]
    });
    var msg = "is already friend";
    if (check_workout_data.status == 1) {
      if (check_workout_data.friends.length !== 0) {
        if (check_workout_data.friends[0].status == 1) {
          msg = "request is already in pending";
        }
        return res.status(config.BAD_REQUEST).json({ message: msg });
      }
    }

    var friend_obj = {
      userId: authUserId,
      friendId: req.body.friendId
    };

    let workout_data = await user_workout_helper.send_friend_request(
      friend_obj
    );
    if (workout_data.status === 0) {
      logger.error("Error while inserting friend request = ", workout_data);
      return res.status(config.BAD_REQUEST).json({ workout_data });
    } else {
      var user = socket.users.get(req.body.friendId);
      var socketIds = user ? user.socketIds : [];
      var user_friends_count = await user_workout_helper.count_friends(
        req.body.friendId
      );
      socketIds.forEach(socketId => {
        io.to(socketId).emit("receive_user_friends_count", {
          count: user_friends_count.count
        });
      });

      return res.status(config.OK_STATUS).json(workout_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({ message: errors });
  }
});

/**
 * @api {delete} /user/user_workouts/:workout_id Delete User workout
 * @apiName Delete User workout
 * @apiGroup  User Workouts
 *
 * @apiHeader {String}  authorization User's unique access-key
 *
 * @apiSuccess (Success 200) {String} Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:workout_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  logger.trace("Delete friend API - Id = ", req.params.workout_id);
  let workout_data = await user_workout_helper.reject_friend({
    _id: req.params.workout_id,
    $or: [{ userId: authUserId }, { friendId: authUserId }]
  });

  if (workout_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(workout_data);
  } else {
    res.status(config.OK_STATUS).json(workout_data);
  }
});

module.exports = router;
