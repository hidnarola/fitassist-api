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

  var schema = {
    type: {
      notEmpty: true,
      errorMessage: "type is required"
    },
    start: {
      notEmpty: true,
      errorMessage: "start date is required"
    },
    end: {
      notEmpty: true,
      errorMessage: "end date is required"
    },
  }

  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var type = req.body.type ? req.body.type : "strength"; // cateogry
    var start = req.body.start;
    var end = req.body.end;
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
      }, {
        start,
        end
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
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
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
  var schema = {
    type: {
      notEmpty: true,
      errorMessage: "type is required"
    },
    subCategory: {
      notEmpty: true,
      errorMessage: "Sub category is required"
    },
    start: {
      notEmpty: true,
      errorMessage: "start date is required"
    },
    end: {
      notEmpty: true,
      errorMessage: "end date is required"
    },
    exerciseId: {
      notEmpty: true,
      errorMessage: "exerciseId is required"
    },
  }
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var type = req.body.type; // cateogry
    var subCategory = req.body.subCategory;
    var start = req.body.start;
    var end = req.body.end;
    var exerciseId = mongoose.Types.ObjectId.isValid(req.body.exerciseId) ? mongoose.Types.ObjectId(req.body.exerciseId) : "all";

    var default_resp_data = {
      status: 1,
      message: "No record found",
      statistics: {
        subCategory: subCategory,
        exerciseId: exerciseId,
        fields: {},
        startDate: start,
        endDate: end
      }
    };
    var condition2 = {
      "exercise.exercises.exercises.category": type,
      "exercise.exercises.exercises.subCategory": subCategory,
    }
    if (exerciseId !== "all") {
      condition2["exercise.exercises.exercises._id"] = exerciseId;
    }

    if (type == "strength") {
      resp_data = await statistics_helper.get_strength_single({
        userId: authUserId,
        isCompleted: 1,
        createdAt: {
          $gte: new Date(start),
          $lte: new Date(end),
        }
      }, condition2, {
        start,
        end
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
    } else if (resp_data.status === 2) {
      logger.error(
        "no user statistics data = ",
        default_resp_data
      );
      res.status(config.OK_STATUS).json(default_resp_data);
    } else {
      logger.error(
        "Error occured while fetching user statistics data = ",
        default_resp_data
      );
      default_resp_data.status = 0;
      res.status(config.INTERNAL_SERVER_ERROR).json(default_resp_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
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
  // var schema = {
  //   type: {
  //     notEmpty: true,
  //     errorMessage: "type is required"
  //   },
  //   subCategory: {
  //     notEmpty: true,
  //     errorMessage: "subCategory is required"
  //   },
  //   start: {
  //     notEmpty: true,
  //     errorMessage: "start date is required"
  //   },
  //   end: {
  //     notEmpty: true,
  //     errorMessage: "end date is required"
  //   },
  //   exerciseId: {
  //     notEmpty: true,
  //     errorMessage: "exerciseId is required"
  //   },
  // }
  // req.checkBody(schema);
  // var errors = req.validationErrors();

  // if (!errors) {

  var returnArray = [];
  for (let x of req.body) {
    var type = x.type; // cateogry
    var subCategory = x.subCategory;
    var start = x.start;
    var end = x.end;
    var exerciseId = x.exerciseId;
    var activeField = x.activeField;
    var condition2 = {};
    var default_resp_data = {
      subCategory: subCategory,
      graphData: [],
      startDate: start,
      endDate: end
    };
    if (exerciseId === "all")
      condition2 = {
        "exercise.exercises.exercises.category": type,
        "exercise.exercises.exercises.subCategory": subCategory,
      }
    else {
      condition2 = {
        "exercise.exercises.exercises.category": type,
        "exercise.exercises.exercises._id": mongoose.Types.ObjectId(exerciseId),
        "exercise.exercises.exercises.subCategory": subCategory,
      }
    }

    if (type == "strength") {
      resp_data = await statistics_helper.get_all_strength_graph_data({
        userId: authUserId,
        isCompleted: 1,
        createdAt: {
          $gte: new Date(start),
          $lte: new Date(end),
        }
      }, condition2, activeField);
    } else if (type == "cardio") {
      resp_data = await statistics_helper.get_cardio({
        userId: authUserId,
        isCompleted: 1
      });
    }

    if (resp_data.status == 1) {

      delete resp_data.status;
      delete resp_data.message;
      resp_data.start = start;
      resp_data.end = end;
      resp_data.subCategory = subCategory;
      console.log('------------------------------------');
      console.log('resp_data : ', resp_data);
      console.log('------------------------------------');

      returnArray.push(resp_data);
    } else if (resp_data.status == 2) {
      returnArray.push(default_resp_data);
    } else {
      default_resp_data.status = 0;
      returnArray.push(default_resp_data);
    }
  }
  var returnObj = {
    status: 1,
    message: "record found",
    statistics: returnArray
  }
  return res.send(returnObj);
  //}
  // else {
  //   logger.error("Validation Error = ", errors);
  //   res.status(config.VALIDATION_FAILURE_STATUS).json({
  //     message: errors
  //   });
  // }


});

module.exports = router;