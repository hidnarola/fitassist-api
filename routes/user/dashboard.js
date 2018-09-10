var express = require("express");
var router = express.Router();
var config = require("../../config");
var logger = config.logger;
var jwtDecode = require("jwt-decode");

var jwtDecode = require("jwt-decode");
var moment = require("moment");
var mongoose = require("mongoose");
var _ = require("underscore");

var widgets_settings_helper = require("../../helpers/widgets_settings_helper");
var user_workouts_helper = require("../../helpers/user_workouts_helper");
var user_timeline_helper = require("../../helpers/user_timeline_helper");
var badge_assign_helper = require("../../helpers/badge_assign_helper");
var workout_progress_helper = require("../../helpers/workout_progress_helper");
var user_posts_helper = require("../../helpers/user_posts_helper");
var user_helper = require("../../helpers/user_helper");
var friend_helper = require("../../helpers/friend_helper");
var common_helper = require("../../helpers/common_helper");

/**
 * @api {get} /user/dashboard Get User Dashboard
 * @apiName Get User Dashboard
 * @apiGroup User Dashboard
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {JSON} dashboard
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  logger.trace("Get all user dashboard API called : ");

  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var startdate = moment().startOf('day').utc();
  var enddate = moment().endOf('day').utc();

  var dashboard = {
    status: 1,
    message: "Success",
    data: {
      userWidgets: null,
      workouts: null,
      activityFeed: null,
      badges: null,
      bodyFat: null,
      profileComplete: null,
    }
  }
  //Widgets
  var widgets = await widgets_settings_helper.get_all_widgets({
    userId: authUserId,
    widgetFor: "dashboard"
  }, {
    "badges": 1,
    "workout": 1,
    "bodyFat": 1,
    "activityFeed": 1,
    "profileComplete": 1
  });

  if (widgets.status === 1) {
    dashboard.data.userWidgets = widgets.widgets;
    if (widgets.widgets.workout) {
      var workout = await user_workouts_helper.get_workouts_by_date({
        userId: authUserId,
        date: {
          $gte: new Date(startdate),
          $lte: new Date(enddate)
        }
      });
      if (workout.status === 1) {
        dashboard.data.workouts = workout.workouts_list;
      } else {
        dashboard.data.workouts = [];
      }
    }
    if (widgets.widgets.activityFeed) {
      var userdata = await friend_helper.find({
        authUserId: authUserId
      });
      var username = userdata.friends.username;
      var resp_data = await friend_helper.get_friend_by_username({
          username: username
        },
        2
      );
      var friendsIds = _.pluck(resp_data.friends, 'authUserId');
      var activityFeed = await user_posts_helper.get_user_timeline({
        userId: {
          $in: friendsIds
        },
        isDeleted: 0
      }, {
        $skip: 0
      }, {
        $limit: 5
      });
      if (activityFeed.status === 1) {
        dashboard.data.activityFeed = activityFeed.timeline;
      } else {
        dashboard.data.activityFeed = [];
      }
    }
    if (widgets.widgets.badges) {
      var badges = await badge_assign_helper.get_all_badges({
        userId: authUserId
      }, {
        $sort: {
          createdAt: -1
        }
      }, {
        $limit: 6
      });
      if (badges.status === 1) {
        dashboard.data.badges = badges.badges;
      }
    }
    if (widgets.widgets.bodyFat) {
      var body = await workout_progress_helper.graph_data_body_fat({
        createdAt: {
          logDate: {
            $gte: new Date(widgets.widgets.bodyFat.start),
            $lte: new Date(widgets.widgets.bodyFat.end)
          },
          userId: authUserId,
        },
      });

      if (body.status === 1) {
        dashboard.data.bodyFat = body.progress;
      }
    }
  }
  var user_data = await user_helper.get_user_by_id(authUserId);
  if (user_data.status === 1) {
    var resp_data = user_data.user;
    var percentage = 0;
    for (const key of Object.keys(resp_data)) {
      if (resp_data[key] != null) {
        if (key == "gender") {
          percentage += 10;
        } else if (key == "dateOfBirth") {
          percentage += 15;
        } else if (key == "height") {
          percentage += 10;
        } else if (key == "weight") {
          percentage += 10;
        } else if (key == "avatar") {
          percentage += 15;
        } else if (key == "aboutMe") {
          percentage += 10;
        } else if (key == "lastName") {
          percentage += 10;
        } else if (key == "mobileNumber") {
          percentage += 10;
        } else if (key == "goal") {
          percentage += 10;
        }
      }
    }
    dashboard.data.profileComplete = percentage;
  }
  return res.send(dashboard);

});


/**
 * @api {post} /user/dashboard/body_fat Save
 * @apiName Save Bodyfat
 * @apiGroup User Dashboard
 * @apiParam start start date
 * @apiParam end end date
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {JSON} widgets JSON of widgets_settings's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/body_fat", async (req, res) => {
  logger.trace("Save user's body fat widgets API called");
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var returnObj = {
    status: 1,
    message: "Success",
    data: {
      widgets: null,
      bodyFat: null
    }
  }
  var schema = {
    start: {
      notEmpty: true,
      errorMessage: "Start date required"
    },
    end: {
      notEmpty: true,
      errorMessage: "End date required"
    }
  }
  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {

    var widgets_settings_object = {
      userId: authUserId,
      modifiedAt: new Date()
    }

    widgets_settings_object.bodyFat = {
      start: req.body.start,
      end: req.body.end
    }

    var widgets_data = await widgets_settings_helper.save_widgets(widgets_settings_object, {
      userId: authUserId,
      widgetFor: "dashboard"
    });

    if (widgets_data && widgets_data.status === 1) {
      returnObj.data.widgets = widgets_data.widgets
      var body = await workout_progress_helper.graph_data_body_fat({
        createdAt: {
          logDate: {
            $gte: new Date(req.body.start),
            $lte: new Date(req.body.end)
          },
          userId: authUserId,
        },
      });

      if (body.status === 1) {
        returnObj.data.bodyFat = body.progress
      }
      logger.trace("user body fat widget saved   = ", returnObj);
      res.status(config.OK_STATUS).json(returnObj);
    } else {
      logger.error("Error occured while saving user body fat widgets = ", widgets_data);
      res.status(config.INTERNAL_SERVER_ERROR).json(widgets_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

/**
 * @api {post} /user/dashboard/complete Workout completed
 * @apiName  Workout completed
 * @apiGroup User Dashboard
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {Array} exerciseId id of Day
 * @apiParam {Object} isCompleted status of workout
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/workout_complete", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var workoutId = mongoose.Types.ObjectId(req.body.workoutId);
  var isCompleted = req.body.isCompleted;

  logger.trace("Complete workout by id = ", workoutId);
  let workout_data = await user_workouts_helper.complete_workout_by_days(
    [workoutId], authUserId, {
      isCompleted: isCompleted
    }
  );

  if (workout_data.status === 1) {
    workout_data = await user_workouts_helper.get_user_workouts_by_id({
      _id: workoutId,
      userId: authUserId
    });
    res.status(config.OK_STATUS).json(workout_data);
    common_helper.assign_badges(authUserId);
  } else {
    res.status(config.INTERNAL_SERVER_ERROR).json(workout_data);
  }
});

module.exports = router;

// if (widgets.widgets.mobility) {
//   var flexibility = await workout_progress_helper.graph_data({
//     createdAt: {
//       createdAt: {
//         $gte: new Date(start),
//         $lte: new Date(end)
//       },
//       userId: authUserId,
//     },
//   }, "flexibility");
//   data.mobility.flexibility = flexibility.progress;
//   var posture = await workout_progress_helper.graph_data({
//     createdAt: {
//       createdAt: {
//         $gte: new Date(start),
//         $lte: new Date(end)
//       },
//       userId: authUserId,
//     },
//   }, "posture");
//   data.mobility.posture = posture.progress;
// }
// if (widgets.widgets.muscle) {
//   resp_data = await workout_progress_helper.user_body_progress({
//     userId: authUserId,
//     logDate: {
//       $gte: new Date(start),
//       $lte: new Date(end)
//     }
//   });
// }
// if (widgets.widgets.strength) {
//   resp_data = await workout_progress_helper.get_progress_detail({
//     createdAt: {
//       createdAt: {
//         $gte: new Date(start),
//         $lte: new Date(end)
//       },
//       userId: authUserId,
//     },
//     category: category
//   });
// }
// if (widgets.widgets.endurance) {
//   resp_data = await workout_progress_helper.user_endurance_test({
//     createdAt: {
//       createdAt: {
//         $gte: new Date(start),
//         $lte: new Date(end)
//       },
//       userId: authUserId,
//     },
//   }, "cardio");
// }