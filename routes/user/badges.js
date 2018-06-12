var express = require("express");
var router = express.Router();
var fs = require("fs");
var path = require("path");
var async = require("async");
var mongoose = require("mongoose");

var config = require("../../config");
var jwtDecode = require("jwt-decode");

var logger = config.logger;

var badge_assign_helper = require("../../helpers/badge_assign_helper");

/**
 * @api {get} /user/badge/:start/:limit Get all
 * @apiName Get all
 * @apiGroup User Badges
 * @apiHeader {String}  authorization user's unique access-key
 * @apiParam {Number}  start start of records
 * @apiParam {Number}  offset offset of records
 * @apiSuccess (Success 200) {JSON} goals JSON of badges_assign's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:type/:start?/:limit?", async (req, res) => {
  logger.trace("Get all user's badges API called");

  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var start = parseInt(req.params.start ? req.params.start : 0);
  var limit = parseInt(req.params.limit ? req.params.limit : 10);
  var type = parseInt(req.params.type ? req.params.type : 1);

  var resp_data = await badge_assign_helper.get_all_badges(
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
    var total_count = await badge_assign_helper.count({
      userId: authUserId,
      isCompleted: type
    });
    resp_data.count = total_count.count;
    logger.trace("user personal goals got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /user/badge Add
 * @apiName Add
 * @apiGroup User Badges
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization user's unique access-key
 * @apiParam {Number} target target of goal
 * @apiParam {String} task task of goal
 * @apiParam {Number} unit unit of goal
 * @apiSuccess (Success 200) {JSON} goal message for successful badges_assign added
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
        options: [[]],
        errorMessage: "Invalid task"
      },
      errorMessage: "task is required"
    }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var badge_obj = {
      userId: authUserId,
      start: 0,
      target: req.body.target,
      unit: req.body.unit,
      task: req.body.task
    };

    let badge_data = await badge_assign_helper.insert_badge(badge_obj);
    if (badge_data.status === 0) {
      logger.error("Error while inserting personal goal data = ", badge_data);
      return res.status(config.BAD_REQUEST).json({ badge_data });
    } else {
      return res.status(config.OK_STATUS).json(badge_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({ message: errors });
  }
});

module.exports = router;
