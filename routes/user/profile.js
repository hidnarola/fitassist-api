var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");
var jwtDecode = require("jwt-decode");
var router = express.Router();
var request = require("request-promise");

var config = require("../../config");
var logger = config.logger;
var base64Img = require("base64-img");
var constant = require("../../constant");

var user_helper = require("../../helpers/user_helper");
var friend_helper = require("../../helpers/friend_helper");
var user_primary_goals_helper = require("../../helpers/user_primary_goals_helper");
var badge_assign_helper = require("../../helpers/badge_assign_helper");
var user_settings_helper = require("../../helpers/user_settings_helper");

var socket = require("../../socket/socketServer");

/**
 * @api {get} /user/profile/preferences Get User Profile preferences
 * @apiName Get Profile preferences
 * @apiGroup User
 * @apiSuccess (Success 200) {JSON} user_settings JSON of users_settings document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/preferences", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var resp_data = await user_settings_helper.get_setting({
    userId: authUserId
  });
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching user profile = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user profile got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {get} /user/profile Get User Profile by AuthID
 * @apiName Get Profile by AuthID
 * @apiGroup User
 * @apiSuccess (Success 200) {Array} user Array of users document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var resp_data = await user_helper.get_user_by({
    authUserId: authUserId
  });
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching user profile = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user profile got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {get} /user/profile/:username Get User Profile by username
 * @apiName Get Profile by username
 * @apiGroup User
 * @apiSuccess (Success 200) {JSON} user JSON of users document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:username", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var friendshipStatus = "";
  var friendshipStatus = "";
  var friendshipId = "";

  var userdata = await friend_helper.find({
    username: req.params.username
  });
  if (userdata.status == 2) {
    return res.status(config.OK_STATUS).json({
      status: 1,
      message: "No username available",
      user: []
    });
  }

  var userAuthId = userdata.friends.authUserId;
  if (userAuthId && typeof userAuthId !== "undefined") {
    if (userAuthId === authUserId) {
      friendshipStatus = "self";
    } else {
      friend_data = await friend_helper.checkFriend({
        $or: [{
            $and: [{
              userId: authUserId
            }, {
              friendId: userAuthId
            }]
          },
          {
            $and: [{
              userId: userAuthId
            }, {
              friendId: authUserId
            }]
          }
        ]
      });

      if (friend_data.friends.length == 1) {
        friendshipId = friend_data.friends[0]._id;
        if (friend_data.friends[0].status == 1) {
          friend_data = await friend_helper.checkFriend({
            userId: authUserId,
            friendId: userAuthId
          });

          if (friend_data.friends.length == 1) {
            friendshipStatus = "request_sent";
          } else {
            friendshipStatus = "request_received";
          }

          friend_data = await friend_helper.checkFriend({
            userId: authUserId,
            friendId: userAuthId
          });
        } else {
          friendshipStatus = "friend";
        }
      } else {
        friendshipStatus = "unknown";
      }
    }
  }

  logger.trace(
    "Get user profile by ID API called : ",
    authUserId,
    req.params.username
  );
  var resp_data = await user_helper.get_user_by({
    username: req.params.username
  });
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching user profile = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    resp_data.user.friendshipStatus = friendshipStatus;
    resp_data.user.friendshipId = friendshipId;
    logger.trace("user profile got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {put} /user/profile Profile - Update
 * @apiName Profile - Update
 * @apiGroup User
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} [firstName] First name of user
 * @apiParam {String} [lastName] Last name of user
 * @apiParam {Number} [mobileNumber] mobileNumber
 * @apiParam {Number} [height] height
 * @apiParam {Number} [weight] weight
 * @apiParam {Enum} [gender] gender | Possible Values ('male', 'female', 'transgender')
 * @apiParam {Date} [dateOfBirth] Date of Birth
 * @apiParam {Enum-Array} [goals] goals | Possible Values ('gain_muscle', 'improve_mobility', 'lose_fat',
 * 'gain_strength', 'gain_power', 'increase_endurance')
 * @apiParam {String} [aboutMe] aboutMe
 * @apiParam {String} [workoutLocation] workoutLocation
 * @apiParam {Boolean} [status] status of profile
 * @apiSuccess (Success 200) {JSON} user JSON of users document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var user_obj = {};
  user_obj.firstName = req.body.firstName;
  user_obj.lastName = req.body.lastName;
  user_obj.mobileNumber = req.body.mobileNumber;
  user_obj.gender = req.body.gender;
  user_obj.dateOfBirth = req.body.dateOfBirth;
  user_obj.height = req.body.height;
  user_obj.weight = req.body.weight;
  user_obj.aboutMe = req.body.aboutMe;
  user_obj.workoutLocation = req.body.workoutLocation;
  user_obj.modifiedAt = new Date();

  let user = await user_helper.get_user_by_id(authUserId);

  if (user.status == 1) {
    if (user.user.goal) {
      if (user.user.goal.name != req.body.goal) {
        if (req.body.goal) {
          user_obj.goal = {
            name: req.body.goal,
            start: 0
          };
        } else {
          user_obj.goal = null;
        }
      }
    } else {
      if (req.body.goal) {
        user_obj.goal = {
          name: req.body.goal,
          start: 0
        };
      } else {
        user_obj.goal = null;
      }
    }
  }

  let user_data = await user_helper.update_user_by_id(authUserId, user_obj);

  if (user_data.status === 1) {
    res.status(config.OK_STATUS).json(user_data);
    var badges = await badgeAssign(authUserId);
  } else if (user_data.status === 2) {
    logger.error("Error while updating user data = ", user_data);
    res.status(config.INTERNAL_SERVER_ERROR).json({
      user_data
    });
  } else {
    logger.error("Error while updating user data = ", user_data);
    res.status(config.INTERNAL_SERVER_ERROR).json({
      user_data
    });
  }
});

/**
 * @api {put} /user/profile/update_aboutme update aboutme - Update
 * @apiName update aboutme - Update
 * @apiGroup User
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} about about of user
 * @apiParam {String} height height of user
 * @apiParam {String} weight weight of user
 * @apiSuccess (Success 200) {JSON} user JSON of users document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/update_aboutme", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var schema = {
    height: {
      notEmpty: true,
      errorMessage: "height is required",
      isDecimal: {
        errorMessage: "Please enter numeric value"
      }
    },
    weight: {
      notEmpty: true,
      errorMessage: "weight is required",
      isDecimal: {
        errorMessage: "Please enter numeric value"
      }
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var user_profile_obj = {};
    if (req.body.aboutMe) {
      user_profile_obj.aboutMe = req.body.aboutMe;
    }
    if (req.body.weight) {
      user_profile_obj.weight = req.body.weight;
    }
    if (req.body.height) {
      user_profile_obj.height = req.body.height;
    }

    let user_data = await user_helper.update_user_by_id(
      authUserId,
      user_profile_obj
    );
    if (user_data.status === 1) {
      res.status(config.OK_STATUS).json(user_data);
      var badges = await badgeAssign(authUserId);
    } else {
      logger.error("Error while updating user data = ", user_data);
      return res.status(config.BAD_REQUEST).json({
        user_data
      });
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

/**
 * @api {put} /user/profile/photo Profile Picture - Update
 * @apiName Profile Picture - Update
 * @apiGroup User
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} user_img base64 encoded data
 * @apiSuccess (Success 200) {String} message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/photo", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var user_obj = {
    avatar: ""
  };
  base_url = config.BASE_URL;
  var dir = "./uploads/user";
  var filename = "user_" + new Date().getTime();
  var filepath = base64Img.imgSync(req.body.user_img, dir, filename);
  var filepath = filepath.replace(/\\/g, "/");

  if (filepath) {
    user_obj.avatar = base_url + filepath;

    resp_data = await user_helper.get_user_by_id(authUserId);
    try {
      fs.unlink(resp_data.user.avatar, function () {});
    } catch (err) {}
    let user_data = await user_helper.update_user_by_id(authUserId, user_obj);

    if (user_data.status === 1) {
      logger.info("Updated user profile", user_data);
      res.status(config.OK_STATUS).json(user_data);
      var badges = await badgeAssign(authUserId);
    } else {
      logger.error("Error while updating user avatar = ", user_data);
      res.status(config.INTERNAL_SERVER_ERROR).json({
        user_data
      });
    }
  } else {
    return res
      .status(config.BAD_REQUEST)
      .json({
        status: 2,
        message: "no image selected"
      });
  }
});

/**
 * @api {put} /user/profile/preferences Save User Preference
 * @apiName Save Preference
 * @apiGroup User
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} distance distance unit of user. <code>Enum : ["km", "mile"]</code>
 * @apiParam {String} weight weight unit of user. <code>Enum : ["kg", "lb"]</code>
 * @apiParam {String} bodyMeasurement body measurement unit of user. <code>Enum : ["cm", "inch"]</code>
 * @apiParam {String} postAccessibility post accessibility of user.
 * @apiParam {String} commentAccessibility comment accessibility of user.
 * @apiParam {String} messageAccessibility message accessibility of user.
 * @apiParam {String} friendRequestAccessibility friend request accessibility of user.
 * @apiSuccess (Success 200) {JSON} user_settings user preference in user_settings detail.
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/preferences", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var schema = {};

  if (req.body.distance) {
    schema.distance = {
      notEmpty: false,
      isIn: {
        options: [
          ["km", "mile"]
        ],
        errorMessage: "distance is invalid"
      },
      errorMessage: "distance unit required"
    };
  }

  if (req.body.weight) {
    schema.weight = {
      notEmpty: false,
      isIn: {
        options: [
          ["kg", "lb"]
        ],
        errorMessage: "weight is invalid"
      },
      errorMessage: "weight unit required"
    };
  }

  if (req.body.bodyMeasurement) {
    schema.bodyMeasurement = {
      notEmpty: false,
      isIn: {
        options: [
          ["cm", "inch"]
        ],
        errorMessage: "body is invalid"
      },
      errorMessage: "body measurement unit required"
    };
  }

  if (req.body.postAccessibility) {
    schema.postAccessibility = {
      notEmpty: false,
      isDecimal: {
        errorMessage: "post accessibility is invalid"
      },
      errorMessage: "post accessibility is required"
    };
  }

  if (req.body.commentAccessibility) {
    schema.commentAccessibility = {
      notEmpty: false,
      isDecimal: {
        errorMessage: "comment accessibility is invalid"
      },
      errorMessage: "comment accessibility is required"
    };
  }

  if (req.body.messageAccessibility) {
    schema.messageAccessibility = {
      notEmpty: false,
      isDecimal: {
        errorMessage: "message accessibility is invalid"
      },
      errorMessage: "message accessibility is required"
    };
  }

  if (req.body.friendRequestAccessibility) {
    schema.friendRequestAccessibility = {
      notEmpty: false,
      isDecimal: {
        errorMessage: "friend request accessibility is invalid"
      },
      errorMessage: "friend request accessibility is required"
    };
  }

  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var setting_obj = {};
    if (req.body.distance) {
      setting_obj.distance = req.body.distance;
    }

    if (req.body.weight) {
      setting_obj.weight = req.body.weight;
    }

    if (req.body.bodyMeasurement) {
      setting_obj.bodyMeasurement = req.body.bodyMeasurement;
    }

    if (req.body.postAccessibility) {
      setting_obj.postAccessibility = req.body.postAccessibility;
    }

    if (req.body.commentAccessibility) {
      setting_obj.commentAccessibility = req.body.commentAccessibility;
    }

    if (req.body.messageAccessibility) {
      setting_obj.messageAccessibility = req.body.messageAccessibility;
    }

    if (req.body.friendRequestAccessibility) {
      setting_obj.friendRequestAccessibility =
        req.body.friendRequestAccessibility;
    }

    setting_obj.modifiedAt = new Date();

    let settings_data = await user_settings_helper.save_settings({
        userId: authUserId
      },
      setting_obj
    );
    if (settings_data.status === 0) {
      logger.error("Error while saving setting  = ", settings_data);
      return res.status(config.BAD_REQUEST).json({
        settings_data
      });
    } else {
      return res.status(config.OK_STATUS).json(settings_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});


async function badgeAssign(authUserId) {

  var user_data = await user_helper.get_user_by_id(authUserId);
  if (user_data.status === 1) {
    var data = user_data.user;

    var percentage = 0;
    for (const key of Object.keys(data)) {
      if (data[key] != null) {
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

    //badge assign
    var badgeAssign = await badge_assign_helper.badge_assign(
      authUserId,
      constant.BADGES_TYPE.PROFILE, {
        percentage: percentage
      }
    );
    return badgeAssign;
  }
  return {
    status: 0
  }
}
module.exports = router;