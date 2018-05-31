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
 * @api {post} /user/settings Save
 * @apiName Save
 * @apiGroup  User Settings
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} distance distance of friend
 * @apiParam {String} weight weight of friend
 * @apiParam {String} body_measurement body_measurement of friend
 * @apiSuccess (Success 200) {JSON} conversation message sent in conversations_replies detail
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
  if (req.body.body_measurement) {
    schema.body_measurement = {
      notEmpty: true,
      isIn: {
        options: [["cm", "inch", "feet"]],
        errorMessage: "body measurement must be from cm, inch or feet"
      },
      errorMessage: "body measurement unit required"
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

    if (req.body.body_measurement) {
      setting_obj.body_measurement = req.body.body_measurement;
    }
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
