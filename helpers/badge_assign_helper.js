var BadgesAssign = require("./../models/badges_assign");
var UserNotifications = require("./../models/user_notifications");
var Badges = require("./../models/badges");
var _ = require("underscore");
var measurement_helper = require("./measurement_helper");
var body_fat_helper = require("./body_fat_helper");
var notification_helper = require("./notification_helper");
var user_helper = require("./user_helper");
var user_recipe_helper = require("./user_recipe_helper");
var user_workouts_helper = require("./user_workouts_helper");
var socket = require("../socket/socketServer");
var constant = require("../constant");
var badges_assign_helper = {

};

/*
 * get_all_badges is used to fetch all badges data
 * @param condition condition of fetch record
 * @param sort object of sorting data
 * @param limit object of limit data
 * @return  status 0 - If any internal error occured while fetching badges data, with error
 *          status 1 - If badges data found, with badges object
 *          status 2 - If badges not found, with appropriate message
 */
badges_assign_helper.get_all_badges = async (condition = {}, sort = {
  $sort: {
    _id: -1
  }
}, limit = false) => {
  try {
    var aggregate = [{
      $match: condition
    },
    {
      $lookup: {
        from: "badges",
        localField: "badgeId",
        foreignField: "_id",
        as: "badges"
      }
    },
    {
      $unwind: "$badges"
    },
    {
      $group: {
        _id: "$_id",
        descriptionCompleted: {
          $first: "$badges.descriptionCompleted"
        },
        descriptionInCompleted: {
          $first: "$badges.descriptionInCompleted"
        },
        unit: {
          $first: "$badges.unit"
        },
        badgeId: {
          $first: "$badgeId"
        },
        value: {
          $first: "$badges.value"
        },
        timeType: {
          $first: "$badges.timeType"
        },
        duration: {
          $first: "$badges.duration"
        },
        point: {
          $first: "$badges.point"
        },
        name: {
          $first: "$badges.name"
        },
        task: {
          $first: "$badges.task"
        },
        createdAt: {
          $first: "$createdAt"
        }
      }
    },
    ];
    if (sort) {
      aggregate.push(sort);
    }
    if (limit) {
      aggregate.push(limit);
    }
    
    var badges = await BadgesAssign.aggregate(aggregate);
    if (badges) {
      return {
        status: 1,
        message: "badges found",
        badges: badges
      };
    } else {
      return {
        status: 2,
        message: "No badges available"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding badges",
      error: err
    };
  }
};


async function badge_assign_for_workout(
  authUserId,
  first,
  all_possible_badges,
  user_gained_badges,
  workout,
  insert_batch_data,
  notification_badges_data
) {
  var first = first;
  for (let single_badge of all_possible_badges) {
    var id = single_badge._id;
    var badge_assigned = _.find(user_gained_badges, user_badge => {
      return user_badge.badgeId.toString() === id.toString();
    });
    if (!badge_assigned) {
      if (single_badge.timeType != "standard") {
        var duration = parseInt(single_badge.baseDuration);
        let user_workout = await user_workouts_helper.workout_detail_for_badges({
          date: {
            $gte: new Date(
              new Date().getTime() - duration * 24 * 60 * 60 * 1000
            )
          },
          userId: authUserId,
          isCompleted: 1
        });

        first = user_workout.workouts[workout];
      }

      if (first >= single_badge.baseValue) {
        var badge_assign_obj = {
          userId: authUserId,
          badgeId: single_badge._id,
          task: single_badge.task,
          category: constant.BADGES_TYPE.WEIGHT_LIFTED.indexOf(single_badge.task) > 0 ? "weight_lifted" : "workouts"

        };
        insert_batch_data.push(badge_assign_obj);
        notification_badges_data.push(single_badge);
        console.log(workout + " badge assigned");
      }
    }
  }
}
async function badge_assign_for_nutrition(
  authUserId,
  first,
  all_possible_badges,
  user_gained_badges,
  nutrients,
  insert_batch_data,
  notification_badges_data
) {
  var first = first;
  for (let single_badge of all_possible_badges) {
    var id = single_badge._id;
    var badge_assigned = _.find(user_gained_badges, user_badge => {
      return user_badge.badgeId.toString() === id.toString();
    });
    if (!badge_assigned) {
      if (single_badge.timeType != "standard") {
        var duration = parseInt(single_badge.baseDuration);
        let user_nutritions = await user_recipe_helper.get_user_nutritions({
          date: {
            $gte: new Date(
              new Date().getTime() - duration * 24 * 60 * 60 * 1000
            )
          },
          userId: authUserId,
          isCompleted: 1
        });

        first = user_nutritions.user_nutrients[nutrients];
      }

      if (first >= single_badge.baseValue) {
        var badge_assign_obj = {
          userId: authUserId,
          badgeId: single_badge._id,
          task: single_badge.task,
          category: "nutritions"

        };
        insert_batch_data.push(badge_assign_obj);
        notification_badges_data.push(single_badge);
        console.log(nutrients + " badge assigned");
      }
    }
  }
}

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
        task: element,
        $and: [{ isDeleted: 0 }, { status: 1 }]
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
                  task: single_badge.task,
                  category: "profile"
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
                task: single_badge.task,
                category: "profile"
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
                  task: single_badge.task,
                  category: "profile"

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
                task: single_badge.task,
                category: "profile"

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
                  task: single_badge.task,
                  category: "profile"

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
                task: single_badge.task,
                category: "profile"

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
              var resp_data = await measurement_helper.get_body_measurement_id({
                userId: authUserId
              }, {
                  logDate: -1
                },
                1
              );
            } else {
              var resp_data = await measurement_helper.get_body_measurement_id({
                logDate: {
                  $gte: new Date(
                    new Date().getTime() - duration * 24 * 60 * 60 * 1000
                  )
                },
                userId: authUserId
              }, {
                  logDate: 1
                },
                1
              );
            }

            if (resp_data.status == 1) {
              var first = resp_data.measurement.weight;
              var last = valueToBeCompare.weight_gain;
              var tmp = 0;
              if (single_badge.timeType === "standard") {
                tmp = last;
              } else {
                tmp = last - first;
              }
              if (tmp >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task,
                  category: "body_mass"

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
              var resp_data = await measurement_helper.get_body_measurement_id({
                userId: authUserId
              }, {
                  logDate: -1
                },
                1
              );
            } else {
              var duration = parseInt(single_badge.baseDuration);
              var resp_data = await measurement_helper.get_body_measurement_id({
                logDate: {
                  $gte: new Date(
                    new Date().getTime() - duration * 24 * 60 * 60 * 1000
                  )
                },
                userId: authUserId
              }, {
                  logDate: 1
                },
                1
              );
            }

            if (resp_data.status == 1) {
              var first = resp_data.measurement.weight;
              var last = valueToBeCompare.weight_loss;
              if (single_badge.timeType === "standard") {
                tmp = last;
              } else {
                tmp = last - first;
              }
              if (tmp <= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task,
                  category: "body_mass"

                };
                insert_batch_data.push(badge_assign_obj);
                notification_badges_data.push(single_badge);
                console.log("weight loss badge assigned");
              }
            }
          }
        }
      } else if (element == "body_fat_loss") {
        for (let single_badge of all_possible_badges) {
          var duration = parseInt(single_badge.baseDuration);
          var id = single_badge._id;

          var badge_assigned = _.find(user_gained_badges, user_badge => {
            return user_badge.badgeId.toString() === id.toString();
          });

          if (!badge_assigned) {
            if (single_badge.timeType == "standard") {
              var resp_data = await body_fat_helper.get_body_fat_logs({
                userId: authUserId
              }, {
                  logDate: -1
                },
                1
              );
            } else {
              var resp_data = await body_fat_helper.get_body_fat_logs({
                logDate: {
                  $gte: new Date(
                    new Date().getTime() - duration * 24 * 60 * 60 * 1000
                  )
                },
                userId: authUserId
              }, {
                  logDate: 1
                },
                1
              );
            }
            if (resp_data.status == 1) {
              var first = resp_data.body_fat_log.bodyFatPer;
              var last = valueToBeCompare.body_fat_loss;
              if (single_badge.timeType === "standard") {
                tmp = last;
              } else {
                tmp = last - first;
              }
              if (tmp <= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task,
                  category: "body_fat"
                };
                insert_batch_data.push(badge_assign_obj);
                notification_badges_data.push(single_badge);
                console.log(element + "  badge assigned");
              }
            }
          }
        }
      }
      else if (element == "body_fat_gain" ||
        element == "body_fat_average" ||
        element == "body_fat_least" ||
        element == "body_fat_most") {
        for (let single_badge of all_possible_badges) {
          var id = single_badge._id;
          var badge_assigned = _.find(user_gained_badges, user_badge => {
            return user_badge.badgeId.toString() === id.toString();
          });
          if (!badge_assigned) {
            if (single_badge.timeType == "standard") {
              var resp_data = await body_fat_helper.get_body_fat_logs({
                userId: authUserId
              }, {
                  logDate: -1
                },
                1
              );
            } else {
              var duration = parseInt(single_badge.baseDuration);
              var resp_data = await body_fat_helper.get_body_fat_logs({
                logDate: {
                  $gte: new Date(
                    new Date().getTime() - duration * 24 * 60 * 60 * 1000
                  )
                },
                userId: authUserId
              }, {
                  logDate: 1
                },
                1
              );
            }
            if (resp_data.status == 1) {
              var first = resp_data.body_fat_log.bodyFatPer;
              var last = valueToBeCompare[element];
              let tmp = last - first;

              if (single_badge.timeType === "standard") {
                tmp = last;
              }

              if (tmp >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task,
                  category: "body_fat"

                };
                insert_batch_data.push(badge_assign_obj);
                notification_badges_data.push(single_badge);
                console.log(element + "  badge assigned");
              }
            }
          }
        }
      }
      else if (element == "neck_measurement_gain") {
        for (let single_badge of all_possible_badges) {
          var duration = parseInt(single_badge.baseDuration);
          var id = single_badge._id;

          var badge_assigned = _.find(user_gained_badges, user_badge => {
            return user_badge.badgeId.toString() === id.toString();
          });

          if (!badge_assigned) {
            if (single_badge.timeType == "standard") {
              var resp_data = await measurement_helper.get_body_measurement_id({
                userId: authUserId
              }, {
                  logDate: -1
                },
                1
              );
            } else {
              var resp_data = await measurement_helper.get_body_measurement_id({
                logDate: {
                  $gte: new Date(
                    new Date().getTime() - duration * 24 * 60 * 60 * 1000
                  )
                },
                userId: authUserId
              }, {
                  logDate: 1
                },
                1
              );
            }
            if (resp_data.status == 1) {
              var first = resp_data.measurement.neck;
              var last = valueToBeCompare.neck_measurement_gain;
              if (single_badge.timeType === "standard") {
                tmp = last;
              } else {
                tmp = last - first;
              }
              if (tmp >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task,
                  category: "body_measurement"

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
              var resp_data = await measurement_helper.get_body_measurement_id({
                userId: authUserId
              }, {
                  logDate: -1
                },
                1
              );
            } else {
              var duration = parseInt(single_badge.baseDuration);
              var resp_data = await measurement_helper.get_body_measurement_id({
                logDate: {
                  $gte: new Date(
                    new Date().getTime() - duration * 24 * 60 * 60 * 1000
                  )
                },
                userId: authUserId
              }, {
                  logDate: 1
                },
                1
              );
            }

            if (resp_data.status == 1) {
              var first = resp_data.measurement.neck;
              var last = valueToBeCompare.neck_measurement_loss;
              if (single_badge.timeType === "standard") {
                tmp = last;
              } else {
                tmp = last - first;
              }
              if (tmp >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task,
                  category: "body_measurement"

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
              var resp_data = await measurement_helper.get_body_measurement_id({
                userId: authUserId
              }, {
                  logDate: -1
                },
                1
              );
            } else {
              var resp_data = await measurement_helper.get_body_measurement_id({
                logDate: {
                  $gte: new Date(
                    new Date().getTime() - duration * 24 * 60 * 60 * 1000
                  )
                },
                userId: authUserId
              }, {
                  logDate: 1
                },
                1
              );
            }
            if (resp_data.status == 1) {
              var first = resp_data.measurement.shoulders;
              var last = valueToBeCompare.shoulders_measurement_gain;
              if (single_badge.timeType === "standard") {
                tmp = last;
              } else {
                tmp = last - first;
              }
              if (tmp >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task,
                  category: "body_measurement"

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
              var resp_data = await measurement_helper.get_body_measurement_id({
                userId: authUserId
              }, {
                  logDate: -1
                },
                1
              );
            } else {
              var duration = parseInt(single_badge.baseDuration);
              var resp_data = await measurement_helper.get_body_measurement_id({
                logDate: {
                  $gte: new Date(
                    new Date().getTime() - duration * 24 * 60 * 60 * 1000
                  )
                },
                userId: authUserId
              }, {
                  logDate: 1
                },
                1
              );
            }

            if (resp_data.status == 1) {
              var first = resp_data.measurement.shoulders;
              var last = valueToBeCompare.shoulders_measurement_loss;
              if (single_badge.timeType === "standard") {
                tmp = last;
              } else {
                tmp = last - first;
              }
              if (tmp >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task,
                  category: "body_measurement"

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
              var resp_data = await measurement_helper.get_body_measurement_id({
                userId: authUserId
              }, {
                  logDate: -1
                },
                1
              );
            } else {
              var resp_data = await measurement_helper.get_body_measurement_id({
                logDate: {
                  $gte: new Date(
                    new Date().getTime() - duration * 24 * 60 * 60 * 1000
                  )
                },
                userId: authUserId
              }, {
                  logDate: 1
                },
                1
              );
            }
            if (resp_data.status == 1) {
              var first = resp_data.measurement.chest;
              var last = valueToBeCompare.chest_measurement_gain;
              if (single_badge.timeType === "standard") {
                tmp = last;
              } else {
                tmp = last - first;
              }
              if (tmp >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task,
                  category: "body_measurement"

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
              var resp_data = await measurement_helper.get_body_measurement_id({
                userId: authUserId
              }, {
                  logDate: -1
                },
                1
              );
            } else {
              var duration = parseInt(single_badge.baseDuration);
              var resp_data = await measurement_helper.get_body_measurement_id({
                logDate: {
                  $gte: new Date(
                    new Date().getTime() - duration * 24 * 60 * 60 * 1000
                  )
                },
                userId: authUserId
              }, {
                  logDate: 1
                },
                1
              );
            }

            if (resp_data.status == 1) {
              var first = resp_data.measurement.chest;
              var last = valueToBeCompare.chest_measurement_loss;
              if (single_badge.timeType === "standard") {
                tmp = last;
              } else {
                tmp = last - first;
              }
              if (tmp >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task,
                  category: "body_measurement"

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
              var resp_data = await measurement_helper.get_body_measurement_id({
                userId: authUserId
              }, {
                  logDate: -1
                },
                1
              );
            } else {
              var resp_data = await measurement_helper.get_body_measurement_id({
                logDate: {
                  $gte: new Date(
                    new Date().getTime() - duration * 24 * 60 * 60 * 1000
                  )
                },
                userId: authUserId
              }, {
                  logDate: 1
                },
                1
              );
            }
            if (resp_data.status == 1) {
              var first = resp_data.measurement.upperArm;
              var last = valueToBeCompare.upper_arm_measurement_gain;
              if (single_badge.timeType === "standard") {
                tmp = last;
              } else {
                tmp = last - first;
              }
              if (tmp >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task,
                  category: "body_measurement"

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
              var resp_data = await measurement_helper.get_body_measurement_id({
                userId: authUserId
              }, {
                  logDate: -1
                },
                1
              );
            } else {
              var duration = parseInt(single_badge.baseDuration);
              var resp_data = await measurement_helper.get_body_measurement_id({
                logDate: {
                  $gte: new Date(
                    new Date().getTime() - duration * 24 * 60 * 60 * 1000
                  )
                },
                userId: authUserId
              }, {
                  logDate: 1
                },
                1
              );
            }

            if (resp_data.status == 1) {
              var first = resp_data.measurement.upperArm;
              var last = valueToBeCompare.upper_arm_measurement_loss;
              if (single_badge.timeType === "standard") {
                tmp = last;
              } else {
                tmp = last - first;
              }
              if (tmp >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task,
                  category: "body_measurement"

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
              var resp_data = await measurement_helper.get_body_measurement_id({
                userId: authUserId
              }, {
                  logDate: -1
                },
                1
              );
            } else {
              var resp_data = await measurement_helper.get_body_measurement_id({
                logDate: {
                  $gte: new Date(
                    new Date().getTime() - duration * 24 * 60 * 60 * 1000
                  )
                },
                userId: authUserId
              }, {
                  logDate: 1
                },
                1
              );
            }
            if (resp_data.status == 1) {
              var first = resp_data.measurement.waist;
              var last = valueToBeCompare.waist_measurement_gain;
              if (single_badge.timeType === "standard") {
                tmp = last;
              } else {
                tmp = last - first;
              }
              if (tmp >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task,
                  category: "body_measurement"

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
              var resp_data = await measurement_helper.get_body_measurement_id({
                userId: authUserId
              }, {
                  logDate: -1
                },
                1
              );
            } else {
              var duration = parseInt(single_badge.baseDuration);
              var resp_data = await measurement_helper.get_body_measurement_id({
                logDate: {
                  $gte: new Date(
                    new Date().getTime() - duration * 24 * 60 * 60 * 1000
                  )
                },
                userId: authUserId
              }, {
                  logDate: 1
                },
                1
              );
            }

            if (resp_data.status == 1) {
              var first = resp_data.measurement.waist;
              var last = valueToBeCompare.waist_measurement_loss;
              if (single_badge.timeType === "standard") {
                tmp = last;
              } else {
                tmp = last - first;
              }
              if (tmp >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task,
                  category: "body_measurement"

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
              var resp_data = await measurement_helper.get_body_measurement_id({
                userId: authUserId
              }, {
                  logDate: -1
                },
                1
              );
            } else {
              var resp_data = await measurement_helper.get_body_measurement_id({
                logDate: {
                  $gte: new Date(
                    new Date().getTime() - duration * 24 * 60 * 60 * 1000
                  )
                },
                userId: authUserId
              }, {
                  logDate: 1
                },
                1
              );
            }
            if (resp_data.status == 1) {
              var first = resp_data.measurement.forearm;
              var last = valueToBeCompare.forearm_measurement_gain;
              if (single_badge.timeType === "standard") {
                tmp = last;
              } else {
                tmp = last - first;
              }
              if (tmp >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task,
                  category: "body_measurement"

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
              var resp_data = await measurement_helper.get_body_measurement_id({
                userId: authUserId
              }, {
                  logDate: -1
                },
                1
              );
            } else {
              var duration = parseInt(single_badge.baseDuration);
              var resp_data = await measurement_helper.get_body_measurement_id({
                logDate: {
                  $gte: new Date(
                    new Date().getTime() - duration * 24 * 60 * 60 * 1000
                  )
                },
                userId: authUserId
              }, {
                  logDate: 1
                },
                1
              );
            }

            if (resp_data.status == 1) {
              var first = resp_data.measurement.forearm;
              var last = valueToBeCompare.forearm_measurement_loss;
              if (single_badge.timeType === "standard") {
                tmp = last;
              } else {
                tmp = last - first;
              }
              if (tmp >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task,
                  category: "body_measurement"

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
              var resp_data = await measurement_helper.get_body_measurement_id({
                userId: authUserId
              }, {
                  logDate: -1
                },
                1
              );
            } else {
              var resp_data = await measurement_helper.get_body_measurement_id({
                logDate: {
                  $gte: new Date(
                    new Date().getTime() - duration * 24 * 60 * 60 * 1000
                  )
                },
                userId: authUserId
              }, {
                  logDate: 1
                },
                1
              );
            }
            if (resp_data.status == 1) {
              var first = resp_data.measurement.hips;
              var last = valueToBeCompare.hips_measurement_gain;
              if (single_badge.timeType === "standard") {
                tmp = last;
              } else {
                tmp = last - first;
              }
              if (tmp >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task,
                  category: "body_measurement"

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
              var resp_data = await measurement_helper.get_body_measurement_id({
                userId: authUserId
              }, {
                  logDate: -1
                },
                1
              );
            } else {
              var duration = parseInt(single_badge.baseDuration);
              var resp_data = await measurement_helper.get_body_measurement_id({
                logDate: {
                  $gte: new Date(
                    new Date().getTime() - duration * 24 * 60 * 60 * 1000
                  )
                },
                userId: authUserId
              }, {
                  logDate: 1
                },
                1
              );
            }

            if (resp_data.status == 1) {
              var first = resp_data.measurement.hips;
              var last = valueToBeCompare.hips_measurement_loss;
              if (single_badge.timeType === "standard") {
                tmp = last;
              } else {
                tmp = last - first;
              }
              if (tmp >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task,
                  category: "body_measurement"

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
              var resp_data = await measurement_helper.get_body_measurement_id({
                userId: authUserId
              }, {
                  logDate: -1
                },
                1
              );
            } else {
              var resp_data = await measurement_helper.get_body_measurement_id({
                logDate: {
                  $gte: new Date(
                    new Date().getTime() - duration * 24 * 60 * 60 * 1000
                  )
                },
                userId: authUserId
              }, {
                  logDate: 1
                },
                1
              );
            }
            if (resp_data.status == 1) {
              var first = resp_data.measurement.thigh;
              var last = valueToBeCompare.thigh_measurement_gain;
              if (single_badge.timeType === "standard") {
                tmp = last;
              } else {
                tmp = last - first;
              }
              if (tmp >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task,
                  category: "body_measurement"

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
              var resp_data = await measurement_helper.get_body_measurement_id({
                userId: authUserId
              }, {
                  logDate: -1
                },
                1
              );
            } else {
              var duration = parseInt(single_badge.baseDuration);
              var resp_data = await measurement_helper.get_body_measurement_id({
                logDate: {
                  $gte: new Date(
                    new Date().getTime() - duration * 24 * 60 * 60 * 1000
                  )
                },
                userId: authUserId
              }, {
                  logDate: 1
                },
                1
              );
            }

            if (resp_data.status == 1) {
              var first = resp_data.measurement.thigh;
              var last = valueToBeCompare.thigh_measurement_gain;
              if (single_badge.timeType === "standard") {
                tmp = last;
              } else {
                tmp = last - first;
              }
              if (tmp >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task,
                  category: "body_measurement"

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
              var resp_data = await measurement_helper.get_body_measurement_id({
                userId: authUserId
              }, {
                  logDate: -1
                },
                1
              );
            } else {
              var resp_data = await measurement_helper.get_body_measurement_id({
                logDate: {
                  $gte: new Date(
                    new Date().getTime() - duration * 24 * 60 * 60 * 1000
                  )
                },
                userId: authUserId
              }, {
                  logDate: 1
                },
                1
              );
            }
            if (resp_data.status == 1) {
              var first = resp_data.measurement.calf;
              var last = valueToBeCompare.calf_measurement_gain;
              if (single_badge.timeType === "standard") {
                tmp = last;
              } else {
                tmp = last - first;
              }
              if (tmp >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task,
                  category: "body_measurement"

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
              var resp_data = await measurement_helper.get_body_measurement_id({
                userId: authUserId
              }, {
                  logDate: -1
                },
                1
              );
            } else {
              var duration = parseInt(single_badge.baseDuration);
              var resp_data = await measurement_helper.get_body_measurement_id({
                logDate: {
                  $gte: new Date(
                    new Date().getTime() - duration * 24 * 60 * 60 * 1000
                  )
                },
                userId: authUserId
              }, {
                  logDate: 1
                },
                1
              );
            }

            if (resp_data.status == 1) {
              var first = resp_data.measurement.calf;
              var last = valueToBeCompare.calf_measurement_loss;
              if (single_badge.timeType === "standard") {
                tmp = last;
              } else {
                tmp = last - first;
              }
              if (tmp >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task,
                  category: "body_measurement"

                };
                insert_batch_data.push(badge_assign_obj);
                notification_badges_data.push(single_badge);
                console.log("calf loss badge assigned");
              }
            }
          }
        }
      } else if (
        constant.BADGES_TYPE.WORKOUTS.concat(
          constant.BADGES_TYPE.WEIGHT_LIFTED
        ).indexOf(element) > 0
      ) {
        var data = badge_assign_for_workout(
          authUserId,
          valueToBeCompare[element],
          all_possible_badges,
          user_gained_badges,
          element,
          insert_batch_data,
          notification_badges_data
        );
      } else if (element == "heart_rate_total" ||
        element == "heart_rate_average" ||
        element == "heart_rate_most" ||
        element == "heart_rate_least") {
        for (let single_badge of all_possible_badges) {
          var duration = parseInt(single_badge.baseDuration);
          var id = single_badge._id;

          var badge_assigned = _.find(user_gained_badges, user_badge => {
            return user_badge.badgeId.toString() === id.toString();
          });

          if (!badge_assigned) {
            if (single_badge.timeType == "standard") {
              var resp_data = await measurement_helper.get_body_measurement_id({
                userId: authUserId
              }, {
                  logDate: -1
                },
                1
              );
            } else {
              var resp_data = await measurement_helper.get_body_measurement_id({
                logDate: {
                  $gte: new Date(
                    new Date().getTime() - duration * 24 * 60 * 60 * 1000
                  )
                },
                userId: authUserId
              }, {
                  logDate: 1
                },
                1
              );
            }
            if (resp_data.status == 1) {
              var first = resp_data.measurement.heartRate;
              var last = valueToBeCompare[element];
              if (single_badge.timeType === "standard") {
                tmp = last;
              } else {
                tmp = last - first;
              }
              if (tmp >= single_badge.baseValue) {
                var badge_assign_obj = {
                  userId: authUserId,
                  badgeId: single_badge._id,
                  task: single_badge.task,
                  category: "heart_rate"
                };
                insert_batch_data.push(badge_assign_obj);
                notification_badges_data.push(single_badge);
                console.log(element + " badge assigned");
              }
            }
          }
        }

      } else if (
        constant.BADGES_TYPE.NUTRITIONS.concat(
          constant.BADGES_TYPE.CALORIES
        ).indexOf(element) > 0
      ) {
        var data = badge_assign_for_nutrition(
          authUserId,
          valueToBeCompare[element],
          all_possible_badges,
          user_gained_badges,
          element,
          insert_batch_data,
          notification_badges_data
        );
      }
    }

    try {
      let insert_badge = await BadgesAssign.insertMany(insert_batch_data);
      let user = await user_helper.get_user_by_id(authUserId);

      if (insert_badge && insert_badge.length > 0) {
        var notification_data_array = [];
        _.each(notification_badges_data, function (notification_badge) {
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