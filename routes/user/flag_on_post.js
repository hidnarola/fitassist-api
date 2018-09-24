var express = require("express");
var mongoose = require("mongoose");
var jwtDecode = require("jwt-decode");
var router = express.Router();
var config = require("../../config");
var logger = config.logger;
var flag_on_post_helper = require("../../helpers/flag_on_post_helper");

/**
 * @api {post} /user/flag_on_post Send
 * @apiName Send
 * @apiGroup  User Post Flag
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} type type of flag 
 * @apiParam {String} comment comment on flag
 * @apiSuccess (Success 200) {JSON} flag detail of flag on post
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var schema = {
    type: {
      notEmpty: true,
      errorMessage: "Type is required"
    },
    postId: {
      notEmpty: true,
      errorMessage: "postId is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var flagObject = {
      userId: authUserId,
      type: req.body.type,
      postId: req.body.postId
    };

    if (req.body.comment) {
      flagObject.comment = req.body.comment
    }

    let flag_data = await flag_on_post_helper.flag_on_post(
      flagObject,
    );

    if (flag_data.status === 1) {
      logger.error("Succesfully sent flag = ", flag_data);
      return res.status(config.OK_STATUS).json(flag_data);
    } else {
      logger.error("Error while sending flag = ", flag_data);
      return res.status(config.BAD_REQUEST).json({
        flag_data
      });
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

module.exports = router;