var BadgesAssign = require("./../models/badges_assign");
var UserNotifications = require("./../models/user_notifications");
var Badges = require("./../models/badges");
var _ = require("underscore");
var measurement_helper = require("./measurement_helper");
var notification_helper = require("./notification_helper");
var user_helper = require("./user_helper");
var socket = require("../socket/socketServer");
var constant = require("../constant");

var badges_assign_helper = {};

/*
   * get_all_badges is used to fetch all badges data
   *
   * @return  status 0 - If any internal error occured while fetching badges data, with error
   *          status 1 - If badges data found, with badges object
   *          status 2 - If badges not found, with appropriate message
   */
badges_assign_helper.get_all_badges = async (
  condition = {},
  skip = {},
  limit = {},
  sort = {}
) => {
  try {
    var badges = await BadgesAssign.aggregate([
      {
        $match: condition
      },
      skip,
      limit,
      sort
    ]);
    if (badges) {
      return {
        status: 1,
        message: "badges found",
        badges: badges
      };
    } else {
      return { status: 2, message: "No badges available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding badges",
      error: err
    };
  }
};

/*
   * badge_assign is used to assign badge
   * @return  status 0 - If any internal error occured while assigning badge data, with error
   *          status 1 - If badge assign, with badge object
   *          status 2 - If badge data not assign, with appropriate message
   */
badges_assign_helper.badge_assign = async (
  authUserId,
  badgesType,
  valueToBeCompare
) => {
  try {
    var insert_batch_data = [];
    var notification_badges_data = [];

    for (let element of badgesType) {
      var badge = await Badges.find({
        task: element
      });

      var all_possible_badges = [];
      for (let singleBadge of badge) {
        all_possible_badges.push(singleBadge);
      }

      var user_gained_badges = await BadgesAssign.find({
        userId: authUserId,
        task: element
      });
      if (element == "profile_update") {
        if (user_gained_badges && user_gained_badges.length > 0) {
          for (let single_badge of all_possible_badges) {
            var id = single_badge._id;
            var badge_assigned = _.find(user_gained_badges, user_badge => {
              return user_badge.badgeId.toString() === id.toString();
            });
            if (!badge_assigned) {
              if (single_badge.baseValue <= valueToBeCompare.percentage) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task
                };
                insert_batch_data.push(badge_assign_obj);
                notification_badges_data.push(single_badge);
              }
            }
          }
        } else {
          for (let single_badge of all_possible_badges) {
            if (single_badge.baseValue <= valueToBeCompare.percentage) {
              var badge_assign_obj = {
                userId: authUserId,
                badgeId: single_badge._id,
                task: single_badge.task
              };
              insert_batch_data.push(badge_assign_obj);
              notification_badges_data.push(single_badge);
            }
          }
        }
      } else if (element == "friends") {
        if (user_gained_badges && user_gained_badges.length > 0) {
          for (let single_badge of all_possible_badges) {
            var id = single_badge._id;
            var badge_assigned = _.find(user_gained_badges, user_badge => {
              return user_badge.badgeId.toString() === id.toString();
            });
            if (!badge_assigned) {
              if (single_badge.baseValue <= valueToBeCompare.friends) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task
                };
                insert_batch_data.push(badge_assign_obj);
                notification_badges_data.push(single_badge);
              }
            }
          }
        } else {
          for (let single_badge of all_possible_badges) {
            if (single_badge.baseValue <= valueToBeCompare.friends) {
              var badge_assign_obj = {
                userId: authUserId,
                badgeId: single_badge._id,
                task: single_badge.task
              };
              insert_batch_data.push(badge_assign_obj);
              notification_badges_data.push(single_badge);
            }
          }
        }
      } else if (element == "post") {
        if (user_gained_badges && user_gained_badges.length > 0) {
          for (let single_badge of all_possible_badges) {
            var id = single_badge._id;
            var badge_assigned = _.find(user_gained_badges, user_badge => {
              return user_badge.badgeId.toString() === id.toString();
            });
            if (!badge_assigned) {
              if (single_badge.baseValue <= valueToBeCompare.post) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task
                };
                insert_batch_data.push(badge_assign_obj);
                notification_badges_data.push(single_badge);
              }
            }
          }
        } else {
          for (let single_badge of all_possible_badges) {
            if (single_badge.baseValue <= valueToBeCompare.post) {
              var badge_assign_obj = {
                userId: authUserId,
                badgeId: single_badge._id,
                task: single_badge.task
              };
              insert_batch_data.push(badge_assign_obj);
              notification_badges_data.push(single_badge);
            }
          }
        }
      } else if (element == "weight_gain") {
        for (let single_badge of all_possible_badges) {
          var duration = parseInt(single_badge.baseDuration);
          var id = single_badge._id;

          var badge_assigned = _.find(user_gained_badges, user_badge => {
            return user_badge.badgeId.toString() === id.toString();
          });

          if (!badge_assigned) {
            if (single_badge.timeType == "standard") {
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  userId: authUserId
                },
                { logDate: -1 },
                1
              );
            } else {
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  logDate: {
                    $gte: new Date(
                      new Date().getTime() - duration * 24 * 60 * 60 * 1000
                    )
                  },
                  userId: authUserId
                },
                { logDate: 1 },
                1
              );
            }

            if (resp_data.status == 1) {
              var firstNeck = resp_data.measurement.weight;
              var lastNeck = valueToBeCompare.weight;

              if (lastNeck - firstNeck >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task
                };
                insert_batch_data.push(badge_assign_obj);
                notification_badges_data.push(single_badge);
                console.log("weight gain badge assigned");
              }
            }
          }
        }
      } else if (element == "weight_loss") {
        for (let single_badge of all_possible_badges) {
          var id = single_badge._id;

          var badge_assigned = _.find(user_gained_badges, user_badge => {
            return user_badge.badgeId.toString() === id.toString();
          });

          if (!badge_assigned) {
            if (single_badge.timeType == "standard") {
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  userId: authUserId
                },
                { logDate: -1 },
                1
              );
            } else {
              var duration = parseInt(single_badge.baseDuration);
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  logDate: {
                    $gte: new Date(
                      new Date().getTime() - duration * 24 * 60 * 60 * 1000
                    )
                  },
                  userId: authUserId
                },
                { logDate: 1 },
                1
              );
            }

            if (resp_data.status == 1) {
              var firstNeck = resp_data.measurement.weight;
              var lastNeck = valueToBeCompare.weight_loss;
              if (lastNeck - firstNeck <= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task
                };
                insert_batch_data.push(badge_assign_obj);
                notification_badges_data.push(single_badge);
                console.log("weight loss badge assigned");
              }
            }
          }
        }
      } else if (element == "body_fat_gain") {
      } else if (element == "body_fat_loss") {
      } else if (element == "body_fat_average") {
      } else if (element == "body_fat_most") {
      } else if (element == "body_fat_least") {
      } else if (element == "neck_measurement_gain") {
        for (let single_badge of all_possible_badges) {
          var duration = parseInt(single_badge.baseDuration);
          var id = single_badge._id;

          var badge_assigned = _.find(user_gained_badges, user_badge => {
            return user_badge.badgeId.toString() === id.toString();
          });

          if (!badge_assigned) {
            if (single_badge.timeType == "standard") {
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  userId: authUserId
                },
                { logDate: -1 },
                1
              );
            } else {
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  logDate: {
                    $gte: new Date(
                      new Date().getTime() - duration * 24 * 60 * 60 * 1000
                    )
                  },
                  userId: authUserId
                },
                { logDate: 1 },
                1
              );
            }
            if (resp_data.status == 1) {
              var firstNeck = resp_data.measurement.neck;
              var lastNeck = valueToBeCompare.neck_measurement_gain;
              if (lastNeck - firstNeck >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task
                };
                insert_batch_data.push(badge_assign_obj);
                notification_badges_data.push(single_badge);
                console.log("neck gain badge assigned");
              }
            }
          }
        }
      } else if (element == "neck_measurement_loss") {
        for (let single_badge of all_possible_badges) {
          var id = single_badge._id;

          var badge_assigned = _.find(user_gained_badges, user_badge => {
            return user_badge.badgeId.toString() === id.toString();
          });

          if (!badge_assigned) {
            if (single_badge.timeType == "standard") {
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  userId: authUserId
                },
                { logDate: -1 },
                1
              );
            } else {
              var duration = parseInt(single_badge.baseDuration);
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  logDate: {
                    $gte: new Date(
                      new Date().getTime() - duration * 24 * 60 * 60 * 1000
                    )
                  },
                  userId: authUserId
                },
                { logDate: 1 },
                1
              );
            }

            if (resp_data.status == 1) {
              var firstNeck = resp_data.measurement.neck;
              var lastNeck = valueToBeCompare.neck_measurement_loss;
              if (lastNeck - firstNeck <= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task
                };
                insert_batch_data.push(badge_assign_obj);
                notification_badges_data.push(single_badge);
                console.log("neck loss badge assigned");
              }
            }
          }
        }
      } else if (element == "shoulders_measurement_gain") {
        for (let single_badge of all_possible_badges) {
          var duration = parseInt(single_badge.baseDuration);
          var id = single_badge._id;

          var badge_assigned = _.find(user_gained_badges, user_badge => {
            return user_badge.badgeId.toString() === id.toString();
          });

          if (!badge_assigned) {
            if (single_badge.timeType == "standard") {
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  userId: authUserId
                },
                { logDate: -1 },
                1
              );
            } else {
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  logDate: {
                    $gte: new Date(
                      new Date().getTime() - duration * 24 * 60 * 60 * 1000
                    )
                  },
                  userId: authUserId
                },
                { logDate: 1 },
                1
              );
            }
            if (resp_data.status == 1) {
              var firstNeck = resp_data.measurement.shoulders;
              var lastNeck = valueToBeCompare.shoulders_measurement_gain;
              if (lastNeck - firstNeck >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task
                };
                insert_batch_data.push(badge_assign_obj);
                notification_badges_data.push(single_badge);
                console.log("shoulders gain badge assigned");
              }
            }
          }
        }
      } else if (element == "shoulders_measurement_loss") {
        for (let single_badge of all_possible_badges) {
          var id = single_badge._id;

          var badge_assigned = _.find(user_gained_badges, user_badge => {
            return user_badge.badgeId.toString() === id.toString();
          });

          if (!badge_assigned) {
            if (single_badge.timeType == "standard") {
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  userId: authUserId
                },
                { logDate: -1 },
                1
              );
            } else {
              var duration = parseInt(single_badge.baseDuration);
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  logDate: {
                    $gte: new Date(
                      new Date().getTime() - duration * 24 * 60 * 60 * 1000
                    )
                  },
                  userId: authUserId
                },
                { logDate: 1 },
                1
              );
            }

            if (resp_data.status == 1) {
              var firstNeck = resp_data.measurement.shoulders;
              var lastNeck = valueToBeCompare.shoulders_measurement_loss;
              if (lastNeck - firstNeck <= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task
                };
                insert_batch_data.push(badge_assign_obj);
                notification_badges_data.push(single_badge);
                console.log("shoulders loss badge assigned");
              }
            }
          }
        }
      } else if (element == "chest_measurement_gain") {
        for (let single_badge of all_possible_badges) {
          var duration = parseInt(single_badge.baseDuration);
          var id = single_badge._id;

          var badge_assigned = _.find(user_gained_badges, user_badge => {
            return user_badge.badgeId.toString() === id.toString();
          });

          if (!badge_assigned) {
            if (single_badge.timeType == "standard") {
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  userId: authUserId
                },
                { logDate: -1 },
                1
              );
            } else {
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  logDate: {
                    $gte: new Date(
                      new Date().getTime() - duration * 24 * 60 * 60 * 1000
                    )
                  },
                  userId: authUserId
                },
                { logDate: 1 },
                1
              );
            }
            if (resp_data.status == 1) {
              var firstNeck = resp_data.measurement.chest;
              var lastNeck = valueToBeCompare.chest_measurement_gain;
              if (lastNeck - firstNeck >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task
                };
                insert_batch_data.push(badge_assign_obj);
                notification_badges_data.push(single_badge);
                console.log("chest gain badge assigned");
              }
            }
          }
        }
      } else if (element == "chest_measurement_loss") {
        for (let single_badge of all_possible_badges) {
          var id = single_badge._id;

          var badge_assigned = _.find(user_gained_badges, user_badge => {
            return user_badge.badgeId.toString() === id.toString();
          });

          if (!badge_assigned) {
            if (single_badge.timeType == "standard") {
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  userId: authUserId
                },
                { logDate: -1 },
                1
              );
            } else {
              var duration = parseInt(single_badge.baseDuration);
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  logDate: {
                    $gte: new Date(
                      new Date().getTime() - duration * 24 * 60 * 60 * 1000
                    )
                  },
                  userId: authUserId
                },
                { logDate: 1 },
                1
              );
            }

            if (resp_data.status == 1) {
              var firstNeck = resp_data.measurement.chest;
              var lastNeck = valueToBeCompare.chest_measurement_loss;
              if (lastNeck - firstNeck <= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task
                };
                insert_batch_data.push(badge_assign_obj);
                notification_badges_data.push(single_badge);
                console.log("chest loss badge assigned");
              }
            }
          }
        }
      } else if (element == "upper_arm_measurement_gain") {
        for (let single_badge of all_possible_badges) {
          var duration = parseInt(single_badge.baseDuration);
          var id = single_badge._id;

          var badge_assigned = _.find(user_gained_badges, user_badge => {
            return user_badge.badgeId.toString() === id.toString();
          });

          if (!badge_assigned) {
            if (single_badge.timeType == "standard") {
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  userId: authUserId
                },
                { logDate: -1 },
                1
              );
            } else {
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  logDate: {
                    $gte: new Date(
                      new Date().getTime() - duration * 24 * 60 * 60 * 1000
                    )
                  },
                  userId: authUserId
                },
                { logDate: 1 },
                1
              );
            }
            if (resp_data.status == 1) {
              var firstNeck = resp_data.measurement.upperArm;
              var lastNeck = valueToBeCompare.upper_arm_measurement_gain;
              if (lastNeck - firstNeck >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task
                };
                insert_batch_data.push(badge_assign_obj);
                notification_badges_data.push(single_badge);
                console.log("upperArm gain badge assigned");
              }
            }
          }
        }
      } else if (element == "upper_arm_measurement_loss") {
        for (let single_badge of all_possible_badges) {
          var id = single_badge._id;

          var badge_assigned = _.find(user_gained_badges, user_badge => {
            return user_badge.badgeId.toString() === id.toString();
          });

          if (!badge_assigned) {
            if (single_badge.timeType == "standard") {
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  userId: authUserId
                },
                { logDate: -1 },
                1
              );
            } else {
              var duration = parseInt(single_badge.baseDuration);
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  logDate: {
                    $gte: new Date(
                      new Date().getTime() - duration * 24 * 60 * 60 * 1000
                    )
                  },
                  userId: authUserId
                },
                { logDate: 1 },
                1
              );
            }

            if (resp_data.status == 1) {
              var firstNeck = resp_data.measurement.upperArm;
              var lastNeck = valueToBeCompare.upper_arm_measurement_loss;
              if (lastNeck - firstNeck <= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task
                };
                insert_batch_data.push(badge_assign_obj);
                notification_badges_data.push(single_badge);
                console.log("upperArm loss badge assigned");
              }
            }
          }
        }
      } else if (element == "waist_measurement_gain") {
        for (let single_badge of all_possible_badges) {
          var duration = parseInt(single_badge.baseDuration);
          var id = single_badge._id;

          var badge_assigned = _.find(user_gained_badges, user_badge => {
            return user_badge.badgeId.toString() === id.toString();
          });

          if (!badge_assigned) {
            if (single_badge.timeType == "standard") {
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  userId: authUserId
                },
                { logDate: -1 },
                1
              );
            } else {
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  logDate: {
                    $gte: new Date(
                      new Date().getTime() - duration * 24 * 60 * 60 * 1000
                    )
                  },
                  userId: authUserId
                },
                { logDate: 1 },
                1
              );
            }
            if (resp_data.status == 1) {
              var firstNeck = resp_data.measurement.waist;
              var lastNeck = valueToBeCompare.waist_measurement_gain;
              if (lastNeck - firstNeck >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task
                };
                insert_batch_data.push(badge_assign_obj);
                notification_badges_data.push(single_badge);
                console.log("waist gain badge assigned");
              }
            }
          }
        }
      } else if (element == "waist_measurement_loss") {
        for (let single_badge of all_possible_badges) {
          var id = single_badge._id;

          var badge_assigned = _.find(user_gained_badges, user_badge => {
            return user_badge.badgeId.toString() === id.toString();
          });

          if (!badge_assigned) {
            if (single_badge.timeType == "standard") {
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  userId: authUserId
                },
                { logDate: -1 },
                1
              );
            } else {
              var duration = parseInt(single_badge.baseDuration);
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  logDate: {
                    $gte: new Date(
                      new Date().getTime() - duration * 24 * 60 * 60 * 1000
                    )
                  },
                  userId: authUserId
                },
                { logDate: 1 },
                1
              );
            }

            if (resp_data.status == 1) {
              var firstNeck = resp_data.measurement.waist;
              var lastNeck = valueToBeCompare.waist_measurement_loss;
              if (lastNeck - firstNeck <= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task
                };
                insert_batch_data.push(badge_assign_obj);
                notification_badges_data.push(single_badge);
                console.log("waist loss badge assigned");
              }
            }
          }
        }
      } else if (element == "forearm_measurement_gain") {
        for (let single_badge of all_possible_badges) {
          var duration = parseInt(single_badge.baseDuration);
          var id = single_badge._id;

          var badge_assigned = _.find(user_gained_badges, user_badge => {
            return user_badge.badgeId.toString() === id.toString();
          });

          if (!badge_assigned) {
            if (single_badge.timeType == "standard") {
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  userId: authUserId
                },
                { logDate: -1 },
                1
              );
            } else {
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  logDate: {
                    $gte: new Date(
                      new Date().getTime() - duration * 24 * 60 * 60 * 1000
                    )
                  },
                  userId: authUserId
                },
                { logDate: 1 },
                1
              );
            }
            if (resp_data.status == 1) {
              var firstNeck = resp_data.measurement.forearm;
              var lastNeck = valueToBeCompare.forearm_measurement_gain;
              if (lastNeck - firstNeck >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task
                };
                insert_batch_data.push(badge_assign_obj);
                notification_badges_data.push(single_badge);
                console.log("forearm gain badge assigned");
              }
            }
          }
        }
      } else if (element == "forearm_measurement_loss") {
        for (let single_badge of all_possible_badges) {
          var id = single_badge._id;

          var badge_assigned = _.find(user_gained_badges, user_badge => {
            return user_badge.badgeId.toString() === id.toString();
          });

          if (!badge_assigned) {
            if (single_badge.timeType == "standard") {
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  userId: authUserId
                },
                { logDate: -1 },
                1
              );
            } else {
              var duration = parseInt(single_badge.baseDuration);
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  logDate: {
                    $gte: new Date(
                      new Date().getTime() - duration * 24 * 60 * 60 * 1000
                    )
                  },
                  userId: authUserId
                },
                { logDate: 1 },
                1
              );
            }

            if (resp_data.status == 1) {
              var firstNeck = resp_data.measurement.forearm;
              var lastNeck = valueToBeCompare.forearm_measurement_loss;
              if (lastNeck - firstNeck <= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task
                };
                insert_batch_data.push(badge_assign_obj);
                notification_badges_data.push(single_badge);
                console.log("forearm loss badge assigned");
              }
            }
          }
        }
      } else if (element == "hips_measurement_gain") {
        for (let single_badge of all_possible_badges) {
          var duration = parseInt(single_badge.baseDuration);
          var id = single_badge._id;

          var badge_assigned = _.find(user_gained_badges, user_badge => {
            return user_badge.badgeId.toString() === id.toString();
          });

          if (!badge_assigned) {
            if (single_badge.timeType == "standard") {
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  userId: authUserId
                },
                { logDate: -1 },
                1
              );
            } else {
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  logDate: {
                    $gte: new Date(
                      new Date().getTime() - duration * 24 * 60 * 60 * 1000
                    )
                  },
                  userId: authUserId
                },
                { logDate: 1 },
                1
              );
            }
            if (resp_data.status == 1) {
              var firstNeck = resp_data.measurement.hips;
              var lastNeck = valueToBeCompare.hips_measurement_gain;
              if (lastNeck - firstNeck >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task
                };
                insert_batch_data.push(badge_assign_obj);
                notification_badges_data.push(single_badge);
                console.log("hips gain badge assigned");
              }
            }
          }
        }
      } else if (element == "hips_measurement_loss") {
        for (let single_badge of all_possible_badges) {
          var id = single_badge._id;

          var badge_assigned = _.find(user_gained_badges, user_badge => {
            return user_badge.badgeId.toString() === id.toString();
          });

          if (!badge_assigned) {
            if (single_badge.timeType == "standard") {
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  userId: authUserId
                },
                { logDate: -1 },
                1
              );
            } else {
              var duration = parseInt(single_badge.baseDuration);
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  logDate: {
                    $gte: new Date(
                      new Date().getTime() - duration * 24 * 60 * 60 * 1000
                    )
                  },
                  userId: authUserId
                },
                { logDate: 1 },
                1
              );
            }

            if (resp_data.status == 1) {
              var firstNeck = resp_data.measurement.hips;
              var lastNeck = valueToBeCompare.hips_measurement_loss;
              if (lastNeck - firstNeck <= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task
                };
                insert_batch_data.push(badge_assign_obj);
                notification_badges_data.push(single_badge);
                console.log("hips loss badge assigned");
              }
            }
          }
        }
      } else if (element == "thigh_measurement_gain") {
        for (let single_badge of all_possible_badges) {
          var duration = parseInt(single_badge.baseDuration);
          var id = single_badge._id;

          var badge_assigned = _.find(user_gained_badges, user_badge => {
            return user_badge.badgeId.toString() === id.toString();
          });

          if (!badge_assigned) {
            if (single_badge.timeType == "standard") {
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  userId: authUserId
                },
                { logDate: -1 },
                1
              );
            } else {
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  logDate: {
                    $gte: new Date(
                      new Date().getTime() - duration * 24 * 60 * 60 * 1000
                    )
                  },
                  userId: authUserId
                },
                { logDate: 1 },
                1
              );
            }
            if (resp_data.status == 1) {
              var firstNeck = resp_data.measurement.thigh;
              var lastNeck = valueToBeCompare.thigh_measurement_gain;
              if (lastNeck - firstNeck >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task
                };
                insert_batch_data.push(badge_assign_obj);
                notification_badges_data.push(single_badge);
                console.log("thigh gain badge assigned");
              }
            }
          }
        }
      } else if (element == "thigh_measurement_loss") {
        for (let single_badge of all_possible_badges) {
          var id = single_badge._id;

          var badge_assigned = _.find(user_gained_badges, user_badge => {
            return user_badge.badgeId.toString() === id.toString();
          });

          if (!badge_assigned) {
            if (single_badge.timeType == "standard") {
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  userId: authUserId
                },
                { logDate: -1 },
                1
              );
            } else {
              var duration = parseInt(single_badge.baseDuration);
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  logDate: {
                    $gte: new Date(
                      new Date().getTime() - duration * 24 * 60 * 60 * 1000
                    )
                  },
                  userId: authUserId
                },
                { logDate: 1 },
                1
              );
            }

            if (resp_data.status == 1) {
              var firstNeck = resp_data.measurement.thigh;
              var lastNeck = valueToBeCompare.thigh_measurement_gain;
              if (lastNeck - firstNeck <= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task
                };
                insert_batch_data.push(badge_assign_obj);
                notification_badges_data.push(single_badge);
                console.log("thigh loss badge assigned");
              }
            }
          }
        }
      } else if (element == "calf_measurement_gain") {
        for (let single_badge of all_possible_badges) {
          var duration = parseInt(single_badge.baseDuration);
          var id = single_badge._id;

          var badge_assigned = _.find(user_gained_badges, user_badge => {
            return user_badge.badgeId.toString() === id.toString();
          });

          if (!badge_assigned) {
            if (single_badge.timeType == "standard") {
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  userId: authUserId
                },
                { logDate: -1 },
                1
              );
            } else {
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  logDate: {
                    $gte: new Date(
                      new Date().getTime() - duration * 24 * 60 * 60 * 1000
                    )
                  },
                  userId: authUserId
                },
                { logDate: 1 },
                1
              );
            }
            if (resp_data.status == 1) {
              var firstNeck = resp_data.measurement.calf;
              var lastNeck = valueToBeCompare.calf_measurement_gain;
              if (lastNeck - firstNeck >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task
                };
                insert_batch_data.push(badge_assign_obj);
                notification_badges_data.push(single_badge);
                console.log("calf gain badge assigned");
              }
            }
          }
        }
      } else if (element == "calf_measurement_loss") {
        for (let single_badge of all_possible_badges) {
          var id = single_badge._id;

          var badge_assigned = _.find(user_gained_badges, user_badge => {
            return user_badge.badgeId.toString() === id.toString();
          });

          if (!badge_assigned) {
            if (single_badge.timeType == "standard") {
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  userId: authUserId
                },
                { logDate: -1 },
                1
              );
            } else {
              var duration = parseInt(single_badge.baseDuration);
              var resp_data = await measurement_helper.get_body_measurement_id(
                {
                  logDate: {
                    $gte: new Date(
                      new Date().getTime() - duration * 24 * 60 * 60 * 1000
                    )
                  },
                  userId: authUserId
                },
                { logDate: 1 },
                1
              );
            }

            if (resp_data.status == 1) {
              var firstNeck = resp_data.measurement.calf;
              var lastNeck = valueToBeCompare.calf_measurement_loss;
              if (lastNeck - firstNeck <= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task
                };
                insert_batch_data.push(badge_assign_obj);
                notification_badges_data.push(single_badge);
                console.log("calf loss badge assigned");
              }
            }
          }
        }
      } else if (element == "weight_lifted_total") {
      } else if (element == "weight_lifted_average") {
      } else if (element == "weight_lifted_most") {
      } else if (element == "weight_lifted_least") {
      } else if (element == "workouts_total") {
      } else if (element == "workouts_average") {
      } else if (element == "reps_least") {
      } else if (element == "reps_total") {
      } else if (element == "reps_average") {
      } else if (element == "reps_most") {
      } else if (element == "sets_least") {
      } else if (element == "running_distance_total") {
      } else if (element == "running_distance_average") {
      } else if (element == "running_distance_most") {
      } else if (element == "running_distance_least") {
      } else if (element == "running_time_average") {
      } else if (element == "running_time_total") {
      } else if (element == "running_elevation_total") {
      } else if (element == "running_elevation_average") {
      } else if (element == "heart_rate_total") {
      } else if (element == "heart_rate_average") {
      } else if (element == "heart_rate_most") {
      } else if (element == "heart_rate_least_") {
      } else if (element == "heart_rate_resting_total") {
      } else if (element == "heart_rate_resting_average") {
      } else if (element == "heart_rate_resting_most") {
      } else if (element == "heart_rate_resting_least") {
      } else if (element == "cycle_distance_total") {
      } else if (element == "cycle_distance_average") {
      } else if (element == "cycle_distance_most") {
      } else if (element == "cycle_distance_least") {
      } else if (element == "cycle_time_total") {
      } else if (element == "cycle_time_average") {
      } else if (element == "cycle_elevation_total") {
      } else if (element == "cycle_elevation_average") {
      } else if (element == "steps_total") {
      } else if (element == "steps_average") {
      } else if (element == "steps_most") {
      } else if (element == "steps_least") {
      } else if (element == "calories_total") {
      } else if (element == "calories_average") {
      } else if (element == "calories_most_") {
      } else if (element == "calories_least_") {
      } else if (element == "calories_excess") {
      } else if (element == "saturated_total") {
      } else if (element == "saturated_average") {
      } else if (element == "saturated_most_") {
      } else if (element == "saturated_least_") {
      } else if (element == "saturated_excess") {
      } else if (element == "trans_total_") {
      } else if (element == "trans_average") {
      } else if (element == "trans_most_") {
      } else if (element == "trans_least_") {
      } else if (element == "trans_excess") {
      } else if (element == "folate_total_") {
      } else if (element == "folate_average") {
      } else if (element == "folate_most_") {
      } else if (element == "folate_least_") {
      } else if (element == "folate_excess") {
      } else if (element == "potassium_total") {
      } else if (element == "potassium_average") {
      } else if (element == "potassium_most") {
      } else if (element == "potassium_least") {
      } else if (element == "potassium_excess") {
      } else if (element == "magnesium_total") {
      } else if (element == "magnesium_average") {
      } else if (element == "magnesium_most") {
      } else if (element == "magnesium_least") {
      } else if (element == "magnesium_excess") {
      } else if (element == "sodium_total") {
      } else if (element == "sodium_average") {
      } else if (element == "sodium_most") {
      } else if (element == "sodium_least") {
      } else if (element == "sodium_excess") {
      } else if (element == "protein_total") {
      } else if (element == "protein_average") {
      } else if (element == "protein_most") {
      } else if (element == "protein_least") {
      } else if (element == "protein_excess") {
      } else if (element == "calcium_total") {
      } else if (element == "calcium_average") {
      } else if (element == "calcium_most") {
      } else if (element == "calcium_least") {
      } else if (element == "calcium_excess") {
      } else if (element == "carbs_total") {
      } else if (element == "carbs_average") {
      } else if (element == "carbs_most") {
      } else if (element == "carbs_least") {
      } else if (element == "carbs_excess") {
      } else if (element == "cholesterol_total") {
      } else if (element == "cholesterol_average") {
      } else if (element == "cholesterol_most") {
      } else if (element == "cholesterol_least") {
      } else if (element == "cholesterol_excess") {
      } else if (element == "polyunsaturated_total") {
      } else if (element == "polyunsaturated_average") {
      } else if (element == "polyunsaturated_most") {
      } else if (element == "polyunsaturated_least") {
      } else if (element == "polyunsaturated_excess") {
      } else if (element == "monounsaturated_total") {
      } else if (element == "monounsaturated_average") {
      } else if (element == "monounsaturated_most") {
      } else if (element == "monounsaturated_least") {
      } else if (element == "monounsaturated_excess") {
      } else if (element == "iron_total") {
      } else if (element == "iron_average") {
      } else if (element == "iron_most") {
      } else if (element == "iron_least") {
      } else if (element == "iron_excess") {
      } else if (element == "fiber_total") {
      } else if (element == "fiber_average") {
      } else if (element == "fiber_most") {
      } else if (element == "fiber_least_") {
      } else if (element == "fiber_excess") {
      }
    }

    try {
      let insert_badge = await BadgesAssign.insertMany(insert_batch_data);
      let user = await user_helper.get_user_by_id(authUserId);

      if (insert_badge && insert_badge.length > 0) {
        var notification_data_array = [];
        _.each(notification_badges_data, function(notification_badge) {
          var tmp = {
            sender: {
              firstName: "system"
            },
            isSeen: 0,
            receiver: {
              firstName: user.user.firstName,
              lastName: user.user.lastName,
              avatar: user.user.avatar,
              username: user.user.username,
              authUserId: user.user.authUserId
            },
            type: constant.NOTIFICATION_MESSAGES.BADGE_GAIN.TYPE,
            body: constant.NOTIFICATION_MESSAGES.BADGE_GAIN.MESSAGE.replace(
              "{message}",
              notification_badge.name
            )
          };
          notification_data_array.push(tmp);
        });

        let notification_data = await notification_helper.add_notifications(
          notification_data_array,
          socket,
          "multiple"
        );

        // console.log("SEND NOTIFICATION TO USER USING SOCKET");
        return {
          status: 1,
          message: "badges assigned",
          badges: insert_badge
        };
      } else {
        return {
          status: 0,
          message: "badges not assigned",
          error: err
        };
      }
    } catch (err) {
      return {
        status: 0,
        message: "badges not assigned",
        error: err
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding badge ",
      error: err
    };
  }
};

/*
   * insert_badge is used to insert into badge collection
   * @param   badge_obj     JSON object consist of all property that need to insert in collection
   * @return  status  0 - If any error occur in inserting badge, with error
   *          status  1 - If badge inserted, with inserted badge document and appropriate message
   * @developed by "amc"
   */
badges_assign_helper.insert_badge = async badge_obj => {
  console.log(badge_obj);
  let badge = new BadgesAssign(badge_obj);
  try {
    let badge_data = await badge.save();
    return {
      status: 1,
      message: "badge assigned",
      badge: badge_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while assigning badge",
      error: err
    };
  }
};

module.exports = badges_assign_helper;
