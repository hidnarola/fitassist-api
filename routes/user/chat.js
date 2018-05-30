var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");
var jwtDecode = require("jwt-decode");

var router = express.Router();

var config = require("../../config");
var logger = config.logger;

var chat_helper = require("../../helpers/chat_helper");
var user_helper = require("../../helpers/user_helper");

/**
 * @api {get} /user/chat/:username Get chat messages by username
 * @apiName Get chat messages by username
 * @apiGroup  User Chat
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {Array} conversations Array of conversations_replies document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:username", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var user = await user_helper.get_user_by({ username: req.params.username });

  var resp_data = await chat_helper.get_messages(
    authUserId,
    user.user.authUserId
  );

  if (resp_data.status == 0) {
    logger.error("Error occured while fetching chat messages = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("chat messages got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /user/chat Send
 * @apiName Send
 * @apiGroup  User Chat
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} reply reply of chat message
 * @apiParam {String} friendId Id of friend
 * @apiSuccess (Success 200) {JSON} conversation message sent in conversations_replies detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var schema = {
    friendId: { notEmpty: true, errorMessage: "friend Id is required" },
    reply: { notEmpty: true, errorMessage: "reply is required " }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var conversations_obj = { userId: authUserId, friendId: req.body.friendId };
    var conversations_replies_obj = {
      userId: authUserId,
      reply: req.body.reply
    };
    let chat_data = await chat_helper.send_message(
      conversations_obj,
      conversations_replies_obj
    );
    if (chat_data.status === 0) {
      logger.error("Error while sending message = ", chat_data);
      return res.status(config.BAD_REQUEST).json({ chat_data });
    } else {
      return res.status(config.OK_STATUS).json(chat_data);
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
 *
 * @apiHeader {String}  authorization User's unique access-key
 *
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
 *
 * @apiHeader {String}  authorization User's unique access-key
 *
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
