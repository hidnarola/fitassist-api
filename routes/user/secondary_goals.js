var express = require("express");
var router = express.Router();
var fs = require("fs");
var path = require("path");
var async = require("async");
var mongoose = require("mongoose");
var config = require("../../config");
var jwtDecode = require("jwt-decode");

var logger = config.logger;

var user_secondary_goals_helper = require("../../helpers/user_secondary_goals_helper");

/**
 * @api {get} /user/secondary_goal Get all
 * @apiName Get all
 * @apiGroup User Secondary Goal
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {JSON} goals JSON of user_secondary_goals 's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  logger.trace("Get all user's secondary_goal API called");

  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var resp_data = await user_secondary_goals_helper.get_secondary_goals({
    userId: authUserId,
    isDeleted: 0
  });

  if (resp_data.status == 0) {
    logger.error(
      "Error occured while fetching get all user secondary_goals = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user secondary goals got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {get} /user/secondary_goal/:goal_id Get by Goal ID
 * @apiName Get by Goal ID
 * @apiGroup User Secondary Goal
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {JSON} goal user_secondary_goals's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:goal_id", async (req, res) => {
  logger.trace(
    "Get user seconday goal by ID API called : ",
    req.params.goal_id
  );
  var resp_data = await user_secondary_goals_helper.get_secondary_goal_by_id({
    _id: mongoose.Types.ObjectId(req.params.goal_id),
    isDeleted: 0
  });
  if (resp_data.status == 0) {
    logger.error(
      "Error occured while fetching user seconday goal = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user seconday goal got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /user/secondary_goal Add
 * @apiName Add
 * @apiGroup User Secondary Goal
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization user's unique access-key
 * @apiParam {String} task task of goal | Possible values<code>
            gain_muscle,
            improve_mobility,
            lose_fat,
            gain_strength,
            gain_power,
            increase_endurance
          </code>
 * @apiSuccess (Success 200) {JSON} goal message for successful user_secondary_goals added
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var schema = {
    task: {
      notEmpty: true,
      errorMessage: "task is required",
      isIn: {
        options: [
          [
            "gain_muscle",
            "improve_mobility",
            "lose_fat",
            "gain_strength",
            "gain_power",
            "increase_endurance"
          ]
        ],
        errorMessage: "Invalid task"
      }
    }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var secondary_goal_obj = {
      userId: authUserId,
      start: 0,
      goal: req.body.task
    };

    let get_secondary_goal_data = await user_secondary_goals_helper.get_secondary_goal_by_id({
      goal: req.body.task,
      userId: authUserId
    });
    if (get_secondary_goal_data.status != 1) {
      let secondary_goal_data = await user_secondary_goals_helper.insert_secondary_goal(
        secondary_goal_obj
      );

      if (secondary_goal_data.status === 0) {
        logger.error(
          "Error while inserting secondary goal data = ",
          secondary_goal_data
        );
        return res.status(config.BAD_REQUEST).json({
          secondary_goal_data
        });
      } else {
        return res.status(config.OK_STATUS).json(secondary_goal_data);
      }
    } else {
      return res
        .status(config.OK_STATUS)
        .json({
          status: 2,
          message: "goal is already exists"
        });
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

/**
 * @api {delete} /user/secondary_goal/:goal_id Delete
 * @apiName Delete
 * @apiGroup User Secondary Goal
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:goal_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  logger.trace("Delete user's seconday goal API - Id = ", req.params.goal_id);
  let user_post_data = await user_secondary_goals_helper.delete_secondary_goal({
    userId: authUserId,
    _id: req.params.goal_id
  });

  if (user_post_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(user_post_data);
  } else {
    res.status(config.OK_STATUS).json(user_post_data);
  }
});
module.exports = router;