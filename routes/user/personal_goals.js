var express = require("express");
var router = express.Router();
var fs = require("fs");
var path = require("path");
var async = require("async");
var mongoose = require("mongoose");

var config = require("../../config");
var jwtDecode = require("jwt-decode");

var logger = config.logger;

var user_personal_goals_helper = require("../../helpers/user_personal_goals_helper");

/**
 * @api {get} /user/personal_goal/:goal_id Get by Goal ID
 * @apiName Get by Goal ID
 * @apiGroup User Personal Goal
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {JSON} goal user_personal_goals's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:goal_id", async (req, res) => {
  logger.trace(
    "Get user personal goal by ID API called : ",
    req.params.goal_id
  );
  var resp_data = await user_personal_goals_helper.get_personal_goal_by_id({
    _id: mongoose.Types.ObjectId(req.params.goal_id)
  });
  if (resp_data.status == 0) {
    logger.error(
      "Error occured while fetching user personal goal = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user personal goal got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});
/**
 * @api {get} /user/personal_goal/:type/:start/:limit Get all
 * @apiName Get all
 * @apiGroup User Personal Goal
 * @apiHeader {String}  authorization user's unique access-key
 * @apiParam {Number}  type type of completed goal 1 for completed and 0 for uncompleted
 * @apiParam {Number}  start start of records
 * @apiParam {Number}  offset offset of records
 * @apiSuccess (Success 200) {JSON} goals JSON of user_personal_goals's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:type/:start?/:limit?", async (req, res) => {
  logger.trace("Get all user's personal_goal API called");

  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var start = parseInt(req.params.start ? req.params.start : 0);
  var limit = parseInt(req.params.limit ? req.params.limit : 10);
  var type = parseInt(req.params.type ? req.params.type : 1);

  var resp_data = await user_personal_goals_helper.get_personal_goals(
    {
      userId: authUserId,
      isCompleted: type
    },
    { $skip: start },
    { $limit: limit },
    {
      $sort: {
        createdAt: -1
      }
    }
  );

  if (resp_data.status == 0) {
    logger.error(
      "Error occured while fetching get all user personal goals = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    var total_count = await user_personal_goals_helper.count({
      userId: authUserId,
      isCompleted: type
    });

    if (total_count.status == 1) {
      resp_data.count = total_count.count;
    } else {
      resp_data.count = 0;
    }
    logger.trace("user personal goals got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /user/personal_goal Add
 * @apiName Add
 * @apiGroup User Personal Goal
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization user's unique access-key
 * @apiParam {Number} target target of goal
 * @apiParam {String} task task of goal
 * @apiParam {Number} unit unit of goal
 * @apiSuccess (Success 200) {JSON} goal message for successful user_personal_goals added
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var schema = {
    target: { notEmpty: true, errorMessage: "target is required" },
    unit: { notEmpty: true, errorMessage: "unit is required" },
    task: {
      notEmpty: false,
      isIn: {
        options: [
          [
            "weight_gain",
            "weight_loss",
            "body_fat_gain",
            "body_fat_loss",
            "body_fat_average",
            "body_fat_most",
            "body_fat_least",
            "neck_measurement_gain",
            "neck_measurement_loss",
            "shoulders_measurement_gain",
            "shoulders_measurement_loss",
            "chest_measurement_gain",
            "chest_measurement_loss",
            "upper_arm_measurement_gain",
            "upper_arm_measurement_loss",
            "waist_measurement_gain",
            "waist_measurement_loss",
            "forearm_measurement_gain",
            "forearm_measurement_loss",
            "hips_measurement_gain",
            "hips_measurement_loss",
            "thigh_measurement_gain",
            "thigh_measurement_loss",
            "calf_measurement_gain",
            "calf_measurement_loss",
            "weight_lifted_total",
            "weight_lifted_average",
            "weight_lifted_most",
            "weight_lifted_least",
            "workouts_total",
            "workouts_average",
            "running_distance_total",
            "running_distance_average",
            "running_distance_most",
            "running_distance_least",
            "running_time_average",
            "running_time_total",
            "running_elevation_total",
            "running_elevation_average",
            "cycle_distance_total",
            "cycle_distance_average",
            "cycle_distance_most",
            "cycle_distance_least",
            "cycle_time_total",
            "cycle_time_average",
            "cycle_elevation_total",
            "cycle_elevation_average",
            "steps_total",
            "steps_average",
            "steps_most",
            "steps_least"
          ]
        ],
        errorMessage: "Invalid task"
      },
      errorMessage: "task is required"
    }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var personal_goal_obj = {
      userId: authUserId,
      start: 0,
      target: req.body.target,
      unit: req.body.unit,
      task: req.body.task
    };

    let personal_goal_data = await user_personal_goals_helper.insert_personal_goal(
      personal_goal_obj
    );
    if (personal_goal_data.status === 0) {
      logger.error(
        "Error while inserting personal goal data = ",
        personal_goal_data
      );
      return res.status(config.BAD_REQUEST).json({ personal_goal_data });
    } else {
      return res.status(config.OK_STATUS).json(personal_goal_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({ message: errors });
  }
});

/**
 * @api {put} /user/personal_goal/:goal_id Update(completed goal)
 * @apiName Update(completed goal)
 * @apiGroup User Personal Goal
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {JSON} goal user_personal_goals details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:goal_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var personal_goal_obj = {
    isCompleted: 1,
    modifiedAt: new Date()
  };

  resp_data = await user_personal_goals_helper.update_personal_goal_by_id(
    { _id: req.params.goal_id },
    personal_goal_obj
  );
  if (resp_data.status === 0) {
    logger.error("Error while updating user personal goal = ", resp_data);
    res.status(config.BAD_REQUEST).json({ resp_data });
  } else {
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {delete} /user/personal_goal/:goal_id Delete
 * @apiName Delete
 * @apiGroup User Personal Goal
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:goal_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  logger.trace("Delete user's personal goal API - Id = ", req.params.goal_id);
  let user_post_data = await user_personal_goals_helper.delete_personal_goal({
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
