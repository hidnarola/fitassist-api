var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");
var mongoose = require("mongoose");
var jwtDecode = require("jwt-decode");

var router = express.Router();

var config = require("../../config");
var logger = config.logger;

var like_comment_helper = require("../../helpers/like_comment_helper");
var user_posts_helper = require("../../helpers/user_posts_helper");

/**
 * @api {post} /user/post/like  Add
 * @apiName Add Comment
 * @apiGroup  Likes
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} postId postId of post
 * @apiSuccess (Success 200) {JSON} timeline added like detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var schema = {
    postId: {
      notEmpty: true,
      errorMessage: "Post Id is required"
    }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var like_obj = {
      userId: authUserId,
      postId: req.body.postId
    };

    let like_data = await like_comment_helper.get_like({
      userId: authUserId,
      postId: req.body.postId
    });
    if (like_data.status === 1) {
      let like_data = await like_comment_helper.delete_like(like_obj);
      if (like_data.status === 0) {
        logger.error("Error while disliking post data = ", like_data);
        return res.status(config.BAD_REQUEST).json({ like_data });
      } else {
        var resp_data = await user_posts_helper.get_user_timeline_by_id({
          _id: mongoose.Types.ObjectId(req.body.postId),
          isDeleted: 0
        });

        if (resp_data.status == 0) {
          logger.error(
            "Error occured while liking user timeline = ",
            req.body.postId
          );
          return res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
        } else {
          resp_data.message = "Post liked";
          logger.trace("user like got successfully = ", resp_data);
          return res.status(config.OK_STATUS).json(resp_data);
        }
        return res.status(config.OK_STATUS).json(like_data);
      }
    } else {
      let like_data = await like_comment_helper.insert_like(like_obj);
      if (like_data.status === 0) {
        logger.error("Error while inserting post data = ", like_data);
        return res.status(config.BAD_REQUEST).json({ like_data });
      } else {
        var resp_data = await user_posts_helper.get_user_timeline_by_id({
          _id: mongoose.Types.ObjectId(req.body.postId),
          isDeleted: 0
        });

        if (resp_data.status == 0) {
          logger.error(
            "Error occured while liking user timeline = ",
            req.body.postId
          );
          return res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
        } else {
          resp_data.message = "Post disliked";

          logger.trace("user like got successfully = ", resp_data);
          return res.status(config.OK_STATUS).json(resp_data);
        }
        return res.status(config.OK_STATUS).json(resp_data);
      }
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({ message: errors });
  }
});

module.exports = router;
