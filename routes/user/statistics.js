var express = require("express");
var router = express.Router();
var config = require("../../config");
var jwtDecode = require("jwt-decode");
var moment = require("moment");
var mongoose = require("mongoose");
var logger = config.logger;

var statistics_helper = require("../../helpers/statistics_helper");

/**
 * @api {post} /user/statistics Get
 * @apiName Get statistics data for strength and cardio
 * @apiGroup User Statistics
 * @apiDescription <font color=red>Type can be strength, cardio</font>
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {JSON} stats JSON of statistics's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  logger.trace("User Statistics API called with " + req.body.type + " type");
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var type = req.body.type ? req.body.type : "strength"; // cateogry
  var subCategory = req.body.subCategory;
  // var start = moment(req.body.start).startOf('day');
  // var end = moment(req.body.end).endOf('day');
  var start = req.body.start;
  var end = req.body.end;
  var activeField = req.body.activeField;


  var resp_data = {
    status: 0,
    message: "No record found",
    statistics: {}
  };

  if (type == "strength") {

    resp_data = await statistics_helper.get_strength({
      userId: authUserId,
      isCompleted: 1,
      createdAt: {
        $gte: new Date(start),
        $lte: new Date(end),
      }
    }, {
      "exercise.exercises.exercises.category": "strength",
    });

  } else if (type == "cardio") {

    resp_data = await statistics_helper.get_cardio({
      userId: authUserId,
      isCompleted: 1
    });
  }

  if (resp_data.status == 1) {
    logger.trace("Get user statistics data successfully   = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  } else {
    logger.error(
      "Error occured while fetching user statistics data = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  }
});


/**
 * @api {post} /user/statistics/single Get
 * @apiName Get statistics data for strength and cardio
 * @apiGroup User Statistics
 * @apiDescription <font color=red>Type can be strength, cardio</font>
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {JSON} stats JSON of statistics's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/single", async (req, res) => {
  logger.trace("User Statistics single API called with " + req.body.type + " type");
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var type = req.body.type ? req.body.type : "strength"; // cateogry
  var subCategory = req.body.subCategory;
  var start = req.body.start;
  var end = req.body.end;
  var exerciseId = mongoose.Types.ObjectId(req.body.exerciseId);;

  var resp_data = {
    status: 0,
    message: "No record found",
    statistics: {}
  };

  if (type == "strength") {

    resp_data = await statistics_helper.get_strength({
      userId: authUserId,
      isCompleted: 1,
      createdAt: {
        $gte: new Date(start),
        $lte: new Date(end),
      }
    }, {
      "exercise.exercises.exercises.category": type,
      "exercise.exercises.exercises._id": exerciseId,
      "exercise.exercises.exercises.subCategory": subCategory,
    });

  } else if (type == "cardio") {

    resp_data = await statistics_helper.get_cardio({
      userId: authUserId,
      isCompleted: 1
    });
  }

  if (resp_data.status == 1) {
    logger.trace("Get user statistics data successfully   = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  } else {
    logger.error(
      "Error occured while fetching user statistics data = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  }
});


/**
 * @api {post} /user/statistics/graph_data Get Graph Data
 * @apiName Get Graph Data
 * @apiGroup User Statistics
 * @apiDescription <font color=red>Type can be strength, cardio</font>
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {JSON} stats JSON of statistics's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/graph_data", async (req, res) => {
  logger.trace("User Statistics graph_data API called with " + req.body.type + " type");
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var type = req.body.type; // cateogry
  var subCategory = req.body.subCategory;
  var start = req.body.start;
  var end = req.body.end;
  var activeField = req.body.activeField;

  var resp_data = {
    status: 0,
    message: "No record found",
    statistics: {},
    graph_data: []
  };

  if (type == "strength") {
    resp_data = await statistics_helper.get_strength({
      userId: authUserId,
      isCompleted: 1,
    });
  } else if (type == "cardio") {
    resp_data = await statistics_helper.get_cardio({
      userId: authUserId,
      isCompleted: 1
    });
  }

  if (resp_data.status == 1) {
    logger.trace("Get user statistics data successfully   = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  } else {
    logger.error(
      "Error occured while fetching user statistics data = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  }
});

module.exports = router;