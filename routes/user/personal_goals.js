var express = require("express");
var router = express.Router();
var fs = require("fs");
var path = require("path");
var async = require("async");
var mongoose = require("mongoose");

var config = require("../../config");
var jwtDecode = require("jwt-decode");
var os = require("os");
var hostname = os.hostname();
console.log("hostname", hostname);

var logger = config.logger;

var user_personal_goals_helper = require("../../helpers/user_personal_goals_helper");

/**
 * @api {get} /user/personal_goal/:goal_id Get by Goal ID
 * @apiName Get by Goal ID
 * @apiGroup User Personal Goal
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {JSON} goal personal_goals's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:goal_id", async (req, res) => {
  logger.trace("Get user post photo by ID API called : ", req.params.goal_id);
  var resp_data = await user_personal_goals_helper.get_personal_goal_by_id({
    _id: mongoose.Types.ObjectId(req.params.goal_id)
  });
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching user post photo = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user post photo got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});
/**
 * @api {get} /user/personal_goal/:type/:start?/:offset? Get all
 * @apiName Get all
 * @apiGroup User Personal Goal
 * @apiHeader {String}  authorization user's unique access-key
 * @apiParam {Number}  type type of completed goal 1 for completed and 0 for uncompleted
 * @apiParam {Number}  start start of records
 * @apiParam {Number}  offset offset of records
 * @apiSuccess (Success 200) {JSON} personal_goals JSON of personal_goals 's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:type?/:start?/:offset?", async (req, res) => {
  logger.trace("Get all user's personal_goal API called");

  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var skip = parseInt(req.params.start ? req.params.start : 0);
  var offset = parseInt(req.params.offset ? req.params.offset : 10);
  var type = parseInt(req.params.type);

  var resp_data = await user_personal_goals_helper.get_personal_goals(
    {
      userId: authUserId,
      isCompleted: type
    },
    {
      $skip: skip
    },
    {
      $limit: offset
    }
  );

  if (resp_data.status == 0) {
    logger.error(
      "Error occured while fetching get all user personal_goals = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
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
 * @apiParam {Number} start start of goal
 * @apiParam {Number} target target of goal
 * @apiParam {Number} unit unit of goal
 * @apiSuccess (Success 200) {JSON} personal_goal message for successful personal_goal added
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var schema = {
    start: { notEmpty: true, errorMessage: "start is required" },
    target: { notEmpty: true, errorMessage: "target is required" },
    unit: { notEmpty: true, errorMessage: "unit is required" }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var personal_goal_obj = {
      userId: authUserId,
      start: req.body.start,
      target: req.body.target,
      unit: req.body.unit
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
 * @api {put} /user/personal_goal/:goal_id Update
 * @apiName Update
 * @apiGroup User Personal Goal
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization user's unique access-key
 * @apiParam {File} image User's  Image
 * @apiSuccess (Success 200) {JSON} user_post_photo user_post_photo details
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
 * @apiSuccess (Success 200) {String} Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:goal_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  logger.trace("Delete user's post photo API - Id = ", req.params.goal_id);
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
