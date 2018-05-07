var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");
var jwtDecode = require("jwt-decode");
var router = express.Router();

var config = require("../../config");
var logger = config.logger;

var user_helper = require("../../helpers/user_helper");
var friend_helper = require("../../helpers/friend_helper");

/**
 * @api {get} /user/profile/username Get User Profile by username
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

  console.log("usedata", userdata);

  var userAuthId = userdata.friends.authUserId;
  if (userAuthId && typeof userAuthId !== "undefined") {
    if (userAuthId === authUserId) {
      friendshipStatus = "self";
    } else {
      // friend_data = await friend_helper.checkFriend({
      //   friendId: userAuthId,
      //   userId: authUserId
      // });
      friend_data = await friend_helper.checkFriend({
        $or: [
          { $and: [{ userId: authUserId }, { friendId: userAuthId }] },
          { $and: [{ userId: userAuthId }, { friendId: authUserId }] }
        ]
      });

      if (friend_data.friends.length == 1) {
		friendshipId=friend_data.friends[0]._id;
        if (friend_data.friends[0].status == 1) {
          friend_data = await friend_helper.checkFriend({
            userId: authUserId,
            friendId: userAuthId
		  });
		  
          if (friend_data.friends.length == 1) {
			friendshipStatus = "request_sent";
		  }
		  else{
			  friendshipStatus = "request_recieved";
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
 * @apiParam {String} firstName First name of user
 * @apiParam {String} lastName Last name of user
 * @apiParam {String} email Email address
 * @apiParam {Number} [mobileNumber] mobileNumber
 * @apiParam {Enum} gender gender | Possible Values ('male', 'female', 'transgender')
 * @apiParam {Date} [dateOfBirth] Date of Birth
 * @apiParam {Enum-Array} [goals] goals | Possible Values ('gain_muscle', 'gain_flexibility', 'lose_fat', 'gain_strength', 'gain_power', 'increase_endurance')
 * @apiParam {File} [user_img] avatar
 * @apiParam {String} [aboutMe] aboutMe
 * @apiParam {Boolean} status status
 * @apiSuccess (Success 200) {Array} user Array of users document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var schema = {
    firstName: {
      notEmpty: true,
      errorMessage: "First name is required"
    },
    lastName: {
      notEmpty: true,
      errorMessage: "Last name is required"
    },
    email: {
      notEmpty: true,
      errorMessage: "Email address is required",
      isEmail: { errorMessage: "Please enter valid email address" }
    },
    gender: {
      notEmpty: true,
      isIn: {
        options: [["male", "female", "transgender"]],
        errorMessage: "Gender can be from male, female or transgender"
      },
      errorMessage: "Gender is required"
    },
    // goals: {
    //   notEmpty: true,
    //   matches: {
    //     options: [
    //       [
    //         "gain_muscle",
    //         "gain_flexibility",
    //         "lose_fat",
    //         "gain_strength",
    //         "gain_power",
    //         "increase_endurance"
    //       ]
    //     ],
    //     errorMessage: "goals can be from Enum"
    //   },
    //   errorMessage: "goals is required"
    // },
    aboutMe: {
      notEmpty: true,
      errorMessage: "About me is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var user_obj = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      mobileNumber: req.body.mobileNumber ? req.body.mobileNumber : null,
      gender: req.body.gender,
      dateOfBirth: req.body.dateOfBirth ? req.body.dateOfBirth : null,
      height: req.body.height ? req.body.height : null,
      weight: req.body.weight ? req.body.weight : null,
      aboutMe: req.body.aboutMe,
      goals: req.body.goals ? req.body.goals : null,
      workoutLocation: req.body.workoutLocation
        ? req.body.workoutLocation
        : null
    };

    //image upload
    var filename;
    if (req.files && req.files["user_img"]) {
      var file = req.files["user_img"];
      var dir = "./uploads/user";
      var mimetype = ["image/png", "image/jpeg", "image/jpg"];

      if (mimetype.indexOf(file.mimetype) != -1) {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
        extention = path.extname(file.name);
        filename = "user_" + new Date().getTime() + extention;
        file.mv(dir + "/" + filename, function(err) {
          if (err) {
            logger.error("There was an issue in uploading image");
            res.send({
              status: config.MEDIA_ERROR_STATUS,
              err: "There was an issue in uploading image"
            });
          } else {
            logger.trace("image has been uploaded. Image name = ", filename);
            //return res.send(200, "null");
          }
        });
      } else {
        logger.error("Image format is invalid");
        res.send({
          status: config.VALIDATION_FAILURE_STATUS,
          err: "Image format is invalid"
        });
      }
    } else {
      logger.info("Image not available to upload. Executing next instruction");
      //res.send(config.MEDIA_ERROR_STATUS, "No image submitted");
    }
    if (filename) {
      user_obj.avatar = "uploads/user/" + filename;
      resp_data = await user_helper.get_user_by_id(authUserId);
      try {
        fs.unlink(resp_data.user.avatar, function() {
          console.log("Image deleted");
        });
      } catch (err) {}
    }

    let user_data = await user_helper.update_user_by_id(authUserId, user_obj);
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

module.exports = router;
