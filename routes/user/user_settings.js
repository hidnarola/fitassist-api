var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");
var jwtDecode = require("jwt-decode");

var router = express.Router();

var config = require("../../config");
var logger = config.logger;

var user_settings_helper = require("../../helpers/user_settings_helper");

/**
 * @api {post} /user/settings Save User Preference
 * @apiName Save Preference
 * @apiGroup  User Settings
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} distance distance unit of user. <code>Enum : ["km", "mile"]</code>
 * @apiParam {String} weight weight unit of user. <code>Enum : ["kg", "lb"]</code>
 * @apiParam {String} bodyMeasurement body measurement unit of user. <code>Enum : ["cm", "inch", "feet"]</code>
 * @apiParam {String} postAccessibility post accessibility of user. <code>Enum : ["public", "friends", "only_me"]</code>
 * @apiParam {String} commentAccessibility comment accessibility of user. <code>Enum : ["public", "friends", "only_me"]</code>
 * @apiParam {String} messageAccessibility message accessibility of user. <code>Enum : ["public", "friends", "only_me"]</code>
 * @apiParam {String} friendRequestAccessibility friend request accessibility of user. <code>Enum : ["public", "friends", "only_me"]</code>
 * @apiSuccess (Success 200) {JSON} user_settings user preference in user_settings detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var schema = {};

  if (req.body.distance) {
    schema.distance = {
      notEmpty: true,
      isIn: {
        options: [["km", "mile"]],
        errorMessage: "distance must be from km or mile"
      },
      errorMessage: "distance unit required"
    };
  }

  if (req.body.weight) {
    schema.weight = {
      notEmpty: true,
      isIn: {
        options: [["kg", "lb"]],
        errorMessage: "weight must be from kg or lb"
      },
      errorMessage: "weight unit required"
    };
  }

  if (req.body.bodyMeasurement) {
    schema.bodyMeasurement = {
      notEmpty: true,
      isIn: {
        options: [["cm", "inch", "feet"]],
        errorMessage: "body measurement must be from cm, inch or feet"
      },
      errorMessage: "body measurement unit required"
    };
  }

  if (req.body.postAccessibility) {
    schema.postAccessibility = {
      notEmpty: true,
      isIn: {
        options: [["public", "friends", "only_me"]],
        errorMessage:
          "post accessibility must be from public, friends or only_me"
      },
      errorMessage: "post accessibility is required"
    };
  }

  if (req.body.commentAccessibility) {
    schema.commentAccessibility = {
      notEmpty: true,
      isIn: {
        options: [["public", "friends", "only_me"]],
        errorMessage:
          "comment accessibility must be from public, friends or only_me"
      },
      errorMessage: "comment accessibility is required"
    };
  }

  if (req.body.messageAccessibility) {
    schema.messageAccessibility = {
      notEmpty: true,
      isIn: {
        options: [["public", "friends", "only_me"]],
        errorMessage:
          "message accessibility must be from public, friends or only_me"
      },
      errorMessage: "message accessibility is required"
    };
  }

  if (req.body.friendRequestAccessibility) {
    schema.friendRequestAccessibility = {
      notEmpty: true,
      isIn: {
        options: [["public", "friends", "only_me"]],
        errorMessage:
          "friend request accessibility must be from public, friends or only_me"
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

    let settings_data = await user_settings_helper.save_settings(
      { userId: authUserId },
      setting_obj
    );
    if (settings_data.status === 0) {
      logger.error("Error while sending message = ", settings_data);
      return res.status(config.BAD_REQUEST).json({ settings_data });
    } else {
      return res.status(config.OK_STATUS).json(settings_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({ message: errors });
  }
});

/**
 * @api {delete} /user/chat/:username Delete
 * @apiName Delete
 * @apiGroup  User Chat
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {String} Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:username", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var user = await user_helper.get_user_by({ username: req.params.username });
  logger.trace("Delete conversation of user. Id is = ", user.user.authUserId);
  let chat_data = await chat_helper.delete_chat_message_by_user_id(
    {
      $or: [
        {
          userId: authUserId,
          friendId: user.user.authUserId
        },
        {
          friendId: authUserId,
          userId: user.user.authUserId
        }
      ]
    },
    {
      isDeleted: 1
    }
  );

  if (chat_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(chat_data);
  } else {
    res.status(config.OK_STATUS).json(chat_data);
  }
});

/**
 * @api {delete} /user/chat/:username/:message_id Delete
 * @apiName Delete
 * @apiGroup  User Chat
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {String} Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:username/:message_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var user = await user_helper.get_user_by({ username: req.params.username });
  logger.trace("Delete conversation of user. Id is = ", user.user.authUserId);
  let chat_data = await chat_helper.delete_chat_message_by_user_id(
    {
      userId: authUserId,
      friendId: user.user.authUserId,
      _id: req.params.message_id
    },
    {
      isDeleted: 1
    }
  );

  if (chat_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(chat_data);
  } else {
    res.status(config.OK_STATUS).json(chat_data);
  }
});

module.exports = router;
