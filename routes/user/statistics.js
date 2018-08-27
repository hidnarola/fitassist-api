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

    var failed_resp_data = {
      status: 0,
      message: "No record found",
      statistics: {
        subCategory: subCategory,
        exerciseId: null,
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
    } else {
      logger.error(
        "Error occured while fetching user statistics data = ",
        failed_resp_data
      );
      res.status(config.INTERNAL_SERVER_ERROR).json(failed_resp_data);
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
  var schema = {
    type: {
      notEmpty: true,
      errorMessage: "type is required"
    },
    subCategory: {
      notEmpty: true,
      errorMessage: "subCategory is required"
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
    var exerciseId = req.body.exerciseId;
    var activeField = req.body.activeField;
    var condition2 = {};
    if (exerciseId === "all")
      condition2 = {
        "exercise.exercises.exercises.category": type,
        "exercise.exercises.exercises.subCategory": subCategory,
      }
    else {
      condition2 = {
        "exercise.exercises.exercises.category": type,
        "exercise.exercises.exercises._id": exerciseId,
        "exercise.exercises.exercises.subCategory": subCategory,
      }
    }

    var failed_resp_data = {
      status: 0,
      message: "No graph record found",
      statistics: {
        subCategory: subCategory
      }
    };

    if (type == "strength") {
      resp_data = await statistics_helper.get_all_strength_graph_data({
        userId: authUserId,
        isCompleted: 1,
        createdAt: {
          $gte: new Date(start),
          $lte: new Date(end),
        }
      }, condition2, activeField, {
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
        failed_resp_data
      );
      res.status(config.INTERNAL_SERVER_ERROR).json(failed_resp_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }


});

module.exports = router;