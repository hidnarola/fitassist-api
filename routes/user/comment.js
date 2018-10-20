var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");
var jwtDecode = require("jwt-decode");
var mongoose = require("mongoose");
var constant = require("../../constant");

var router = express.Router();

var config = require("../../config");
var logger = config.logger;

var like_comment_helper = require("../../helpers/like_comment_helper");
var user_posts_helper = require("../../helpers/user_posts_helper");
var common_helper = require("../../helpers/common_helper");
var socket = require("../../socket/socketServer");

/**
 * @api {post} /user/post/comment  Add
 * @apiName Add
 * @apiGroup  User Post Comment
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} comment comment of post
 * @apiParam {String} postId postId of post
 * @apiSuccess (Success 200) {JSON} timeline added comment detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var schema = {
    comment: {
      notEmpty: true,
      errorMessage: "Comment is required"
    },
    postId: {
      notEmpty: true,
      errorMessage: "Post Id is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var comment_obj = {
      userId: authUserId,
      postId: req.body.postId,
      comment: req.body.comment
    };

    let comment_data = await like_comment_helper.insert_comment(comment_obj);
    if (comment_data.status === 0) {
      logger.error("Error while inserting comment data = ", comment_data);
      return res.status(config.BAD_REQUEST).json({
        comment_data
      });
    } else {
      var resp_data = await user_posts_helper.get_user_timeline_by_id({ _id: mongoose.Types.ObjectId(req.body.postId), isDeleted: 0 }, authUserId);
      if (resp_data.status == 0) {
        logger.error(
          "Error occured while commenting user timeline = ",
          req.body.postId
        );
        return res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
      } else {
        if (authUserId.toString() !== resp_data.timeline.created_by.authUserId.toString()) {
          var notificationObj = {
            senderId: authUserId,
            receiverId: resp_data.timeline.created_by.authUserId,
            timelineId: req.body.postId,
            type: constant.NOTIFICATION_MESSAGES.COMMENT.TYPE,
            bodyMessage: constant.NOTIFICATION_MESSAGES.COMMENT.MESSAGE
          };
          await common_helper.send_notification(notificationObj, socket);
        }
        resp_data.message = "comment successfully";
        logger.trace("user posted comment successfully = ", resp_data);
        return res.status(config.OK_STATUS).json(resp_data);
      }
    }
  } else {
    logger.error("Validation Error = ", errors);
    return res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

/**
 * @api {put} /user/post/comment/:comment_id  Update
 * @apiName Update
 * @apiGroup  User Post Comment
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} comment comment of post
 * @apiParam {String} postId postId of post
 * @apiSuccess (Success 200) {JSON} timeline updated comment detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.put("/:comment_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var schema = {
    comment: {
      notEmpty: true,
      errorMessage: "Comment is required"
    },
    postId: {
      notEmpty: true,
      errorMessage: "Post Id is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var comment_obj = {
      userId: authUserId,
      postId: req.body.postId,
      comment: req.body.comment,
      modifiedAt: new Date()
    };

    let comment_data = await like_comment_helper.update_comment(
      {
        _id: req.params.comment_id,
        userId: authUserId
      },
      comment_obj
    );
    if (comment_data.status === 0) {
      logger.error("Error while inserting comment data = ", comment_data);
      return res.status(config.BAD_REQUEST).json({
        comment_data
      });
    } else {
      return res.status(config.OK_STATUS).json(comment_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

/**
 * @api {delete} /user/post/comment/:comment_id Delete
 * @apiName Delete
 * @apiGroup  User Post Comment
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:comment_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  logger.trace("Delete comment API - Id = ", req.params.comment_id);
  let comment_data = await like_comment_helper.delete_comment({
    _id: req.params.comment_id,
    userId: authUserId
  });

  if (comment_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(comment_data);
  } else {
    res.status(config.OK_STATUS).json(comment_data);
  }
});

module.exports = router;
