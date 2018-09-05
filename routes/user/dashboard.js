var express = require("express");
var router = express.Router();
var config = require("../../config");
var logger = config.logger;
var jwtDecode = require("jwt-decode");

var jwtDecode = require("jwt-decode");
var moment = require("moment");

var widgets_settings_helper = require("../../helpers/widgets_settings_helper");
var user_workouts_helper = require("../../helpers/user_workouts_helper");
var user_timeline_helper = require("../../helpers/user_timeline_helper");
var badge_assign_helper = require("../../helpers/badge_assign_helper");
var workout_progress_helper = require("../../helpers/workout_progress_helper");
var user_helper = require("../../helpers/user_helper");

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

  var startdate = moment().utcOffset(0);
  startdate.toISOString();
  startdate.format();

  var enddate = moment()
    .utcOffset(0)
    .add(23, "hours")
    .add(59, "minutes");
  enddate.toISOString();
  enddate.format();



  var dashboard = {
    status: 1,
    message: "success",
    data: {
      userWidgets: null,
      todaysWorkout: null,
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
    if (widgets.widgets.workout && widgets.widgets.workout.status === 1) {
      var workout = await user_workouts_helper.get_all_workouts_group_by({
        userId: authUserId,
        date: {
          $gte: new Date(widgets.widgets.workout.start),
          $lte: new Date(widgets.widgets.workout.end)
        }
      });
      if (workout.status === 1) {
        dashboard.data.todaysWorkout = workout.workouts;
      }
    }
    if (widgets.widgets.activityFeed) {}
    if (widgets.widgets.badges) {
      var badges = await badge_assign_helper.get_all_badges({
        userId: authUserId
      }, {
        $sort: {
          createdAt: -1
        }
      }, {
        $limit: 5
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
  }
  //Today's workout

  return res.send(dashboard);

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