var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");
var mongoose = require("mongoose");
var jwtDecode = require("jwt-decode");
var router = express.Router();
var config = require("../../config");
var logger = config.logger;
var chat_helper = require("../../helpers/chat_helper");
var user_helper = require("../../helpers/user_helper");

/**
 * @api {get} /user/chat/messages/:start?/:limit? Get recently messages
 * @apiName Get recently messages
 * @apiGroup  User Chat
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {Array} messages Array of conversations_replies document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/messages/:start?/:limit?/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var start = parseInt(req.params.start ? req.params.start : 0);
  var limit = parseInt(req.params.limit ? req.params.limit : 10);

  var resp_data = await chat_helper.get_messages(
    authUserId,
    {
      $skip: start
    },
    {
      $limit: limit
    }
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
 * @api {get} /user/chat/channel_id/:start?/:limit? Get recently messages
 * @apiName Get recently messages
 * @apiGroup  User Chat
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {Array} channels Array of conversations_replies document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:channel_id/:start?/:limit?/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var channel_id = {
    _id: mongoose.Types.ObjectId(req.params.channel_id)
  };

  var start = parseInt(req.params.start ? req.params.start : 0);
  var limit = parseInt(req.params.limit ? req.params.limit : 10);

  var resp_data = await chat_helper.get_conversation(
    authUserId,
    channel_id,
    {
      $skip: start
    },
    {
      $limit: limit
    }
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
 * @api {get} /user/chat/ Get unread  messages count
 * @apiName Get unread  messages count
 * @apiGroup  User Chat
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {Array} channels Array of conversations_replies document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var channel_id = {
    _id: mongoose.Types.ObjectId(req.params.channel_id)
  };

  var start = parseInt(req.params.start ? req.params.start : 0);
  var limit = parseInt(req.params.limit ? req.params.limit : 10);

  var resp_data = await chat_helper.count_unread_messages(authUserId);

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
 * @apiParam {String} message message of chat conversation
 * @apiParam {String} friendId Id of friend
 * @apiSuccess (Success 200) {JSON} channel message sent in conversations_replies detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var timestamp = req.body.timestamp;
  var respObj = {};
  var schema = {
    friendId: {
      notEmpty: true,
      errorMessage: "friend Id is required"
    },
    message: {
      notEmpty: true,
      isLength: {
        errorMessage: "Chat must not be blank",
        options: {
          min: 1
        }
      },
      errorMessage: "message is required "
    }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var conversations_obj = {
      userId: authUserId,
      friendId: req.body.friendId
    };
    var conversations_replies_obj = {
      userId: authUserId,
      message: req.body.message
    };
    let chat_data = await chat_helper.send_message(
      conversations_obj,
      conversations_replies_obj
    );
    if (chat_data.status === 1) {
      var user = await user_helper.get_user_by_id(chat_data.channel.userId);
      respObj.status = chat_data.status;
      respObj.message = chat_data.message;
      respObj.channel = {
        _id: chat_data.channel._id,
        isSeen: chat_data.channel.isSeen,
        message: chat_data.channel.message,
        createdAt: chat_data.channel.createdAt,
        fullName:
          user.user.firstName +
          (user.user.lastName ? ` ${user.user.lastName}` : ""),
        authUserId: user.user.authUserId,
        username: user.user.username,
        avatar: user.user.avatar,
        flag: "sent"
      };
      respObj.metadata = {
        timestamp: timestamp
      };
      return res.status(config.OK_STATUS).json(respObj);
    } else {
      logger.error("Error while sending message = ", chat_data);
      return res.status(config.BAD_REQUEST).json({
        chat_data
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
 * @api {delete} /user/chat/:username Delete
 * @apiName Delete
 * @apiGroup  User Chat
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:username", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var user = await user_helper.get_user_by({
    username: req.params.username
  });
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
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:username/:message_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var user = await user_helper.get_user_by({
    username: req.params.username
  });
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
