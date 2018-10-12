var express = require("express");
var router = express.Router();
var config = require("../../config");
var jwtDecode = require("jwt-decode");
var mongoose = require("mongoose");
var logger = config.logger;
var _ = require("underscore");

var statistics_helper = require("../../helpers/statistics_helper");
var user_workouts_helper = require("../../helpers/user_workouts_helper");
var friend_helper = require("../../helpers/friend_helper");
var user_helper = require("../../helpers/user_helper");

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
    resp_data = await statistics_helper.get_statistics_data({
      userId: authUserId,
      isCompleted: 1,
      type: type,
      logDate: {
        $gte: new Date(start),
        $lte: new Date(end),
      },
    }, {
        start,
        end
      });

    overview = await statistics_helper.get_overview_statistics_data({
      userId: authUserId,
      isCompleted: 1,
      type: type,
      logDate: {
        $gte: new Date(start),
        $lte: new Date(end),
      }
    }, {
        start,
        end
      });

    if (overview.status === 1) {
      if (resp_data.statistics) {
        resp_data.statistics.data.splice(0, 0, overview.overview);
      }
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
  var condition = {};
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
    condition = {
      userId: authUserId,
      isCompleted: 1,
      logDate: {
        $gte: new Date(start),
        $lte: new Date(end),
      },
      type: type,
      subType: subCategory
    }

    if (exerciseId !== "all") {
      condition.exerciseId = exerciseId;
    }
    if (subCategory === "Overview") {
      resp_data = await statistics_helper.get_overview_single_data({
        userId: authUserId,
        isCompleted: 1,
        type: type,
        logDate: {
          $gte: new Date(start),
          $lte: new Date(end),
        }
      }, {
          start,
          end
        });
    } else {
      resp_data = await statistics_helper.get_statistics_single_data(condition, {
        start,
        end
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
  var returnArray = [];
  var friend_overview_data = {
    status: 0,
    message: "no record found"
  }
  var username = await user_helper.get_user_by_id(authUserId);
  username = username.user.username;

  var resp_data = await friend_helper.get_friend_by_username({
    username: username
  },
    2
  );
  var friendsIds = _.pluck(resp_data.friends, 'authUserId');
  var totalFriends = friendsIds.length;
  var totalGlobalUserCount = 0;
  var totalGlobalUser = await user_workouts_helper.totalGlobalUserWhoHaveCompletedExercises();

  if (totalGlobalUser.status == 1) {
    totalGlobalUserCount = totalGlobalUser.count
  }

  for (let x of req.body) {
    var type = x.type; // cateogry
    var subCategory = x.subCategory;
    var start = x.start;
    var end = x.end;
    var exerciseId = x.exerciseId;
    var activeField = x.activeField;
    var resp_data;
    var condition = {
      userId: authUserId,
      isCompleted: 1,
      logDate: {
        $gte: new Date(start),
        $lte: new Date(end),
      },
      type: type,
      subType: subCategory
    }
    var default_resp_data = {
      subCategory: subCategory,
      graphData: [],
      startDate: start,
      endDate: end
    };

    if (subCategory === "Overview") {
      resp_data = await statistics_helper.graph_data({
        userId: authUserId,
        type: type,
        isCompleted: 1,
        logDate: {
          $gte: new Date(start),
          $lte: new Date(end),
        }
      }, activeField, authUserId);

      friend_overview_data = await statistics_helper.graph_data({
        userId: {
          $in: friendsIds
        },
        isCompleted: 1,
        logDate: {
          $gte: new Date(start),
          $lte: new Date(end),
        }
      }, activeField, authUserId);
      _.map(friend_overview_data.graphData, function (o) {
        o.count = parseFloat((o.count / totalFriends).toFixed(2));
      });


      global_overview_data = await statistics_helper.graph_data({
        isCompleted: 1,
        logDate: {
          $gte: new Date(start),
          $lte: new Date(end),
        }
      }, activeField, authUserId);
      _.map(global_overview_data.graphData, function (o) {
        o.count = parseFloat((o.count / totalGlobalUserCount).toFixed(2));
      });
    } else {
      if (exerciseId !== "all") {
        condition.exerciseId = mongoose.Types.ObjectId(exerciseId);
      }

      resp_data = await statistics_helper.graph_data(condition, activeField, authUserId);
      condition.userId = {
        $in: friendsIds
      }

      friend_overview_data = await statistics_helper.graph_data(condition, activeField, authUserId);
      _.map(friend_overview_data.graphData, function (o) {
        o.count = parseFloat((o.count / totalFriends).toFixed(2));
      });

      delete condition.userId;
      global_overview_data = await statistics_helper.graph_data(condition, activeField, authUserId);
      _.map(global_overview_data.graphData, function (o) {
        o.count = parseFloat((o.count / totalGlobalUserCount).toFixed(2));
      });
    }

    if (resp_data.status == 1) {
      _.map(global_overview_data.graphData, function (o) {
        o.globalAvg = o.count;
        delete o.count;
        o.friendAvg = 0;
        o.self = 0;

        let tmp = _.findWhere(friend_overview_data.graphData, {
          dateToCompare: o.dateToCompare
        });
        if (tmp) {
          o.friendAvg = tmp.count
        }

        tmp = _.findWhere(resp_data.graphData, {
          dateToCompare: o.dateToCompare
        });

        if (tmp) {
          o.self = tmp.count
        }
      })

      delete resp_data.status;
      delete resp_data.message;
      resp_data.graphData = global_overview_data.graphData;
      resp_data.start = start;
      resp_data.end = end;
      resp_data.subCategory = subCategory;
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
});

module.exports = router;