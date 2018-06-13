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
 * @apiSuccess (Success 200) {Array} user Array of users document
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
        $or: [
          { $and: [{ userId: authUserId }, { friendId: userAuthId }] },
          { $and: [{ userId: userAuthId }, { friendId: authUserId }] }
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
 * @apiParam {Enum-Array} [goals] goals | Possible Values ('gain_muscle', 'gain_flexibility', 'lose_fat',
 * 'gain_strength', 'gain_power', 'increase_endurance')
 * @apiParam {String} [aboutMe] aboutMe
 * @apiParam {String} [workoutLocation] workoutLocation
 * @apiParam {Boolean} [status] status of profile
 * @apiSuccess (Success 200) {Array} user Array of users document
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

  let find_goal_data = await user_primary_goals_helper.get_primary_goal_by_id({
    goal: req.body.goal,
    userId: authUserId
  });

  if (find_goal_data.status !== 1) {
    let goal_object = {
      userId: authUserId,
      start: 0,
      unit: 0,
      goal: req.body.goal
    };
    let goal_data = await user_primary_goals_helper.insert_primary_goal(
      goal_object
    );
    if (goal_data.status == 1) {
      user_obj.goal = goal_data.goal._id;
    }
  }

  let user_data = await user_helper.update_user_by_id(authUserId, user_obj);

  if (user_data.status === 0) {
    logger.error("Error while updating user data = ", user_data);
    return res.status(config.INTERNAL_SERVER_ERROR).json({ user_data });
  } else {
    var data = user_data.user;
    var percentage = 0;
    for (const key of Object.keys(data)) {
      if (data[key] != null) {
        if (key == "gender") {
          percentage += 10;
        } else if (key == "dateOfBirth") {
          percentage += 10;
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
          percentage += 15;
        } else if (key == "goal") {
          percentage += 10;
        }
      }
    }

    var badgeAssign = await badge_assign_helper.badge_assign(
      authUserId,
      constant.BADGES_TYPE.PROFILE,
      percentage,
      user_data.user
    );

    console.log("------------------------------------");
    console.log("badgeAssign : ", badgeAssign);
    console.log("------------------------------------");

    return res.status(config.OK_STATUS).json(badgeAssign);
    // return res.status(config.OK_STATUS).json(user_data);
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
      isDecimal: { errorMessage: "Please enter numeric value" }
    },
    weight: {
      notEmpty: true,
      errorMessage: "weight is required",
      isDecimal: { errorMessage: "Please enter numeric value" }
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
    if (user_data.status === 0) {
      logger.error("Error while updating user data = ", user_data);
      return res.status(config.BAD_REQUEST).json({ user_data });
    } else {
      return res.status(config.OK_STATUS).json(user_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({ message: errors });
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
      fs.unlink(resp_data.user.avatar, function() {
        console.log("Image deleted");
      });
    } catch (err) {}
    let user_data = await user_helper.update_user_by_id(authUserId, user_obj);
    if (user_data.status === 0) {
      logger.error("Error while updating user avatar = ", user_data);
      return res.status(config.BAD_REQUEST).json({ user_data });
    } else {
      return res.status(config.OK_STATUS).json(user_data);
    }
  } else {
    return res
      .status(config.BAD_REQUEST)
      .json({ status: 2, message: "no image selected" });
  }
});

module.exports = router;
