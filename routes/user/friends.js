var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");
var jwtDecode = require("jwt-decode");

var router = express.Router();

var config = require("../../config");
var logger = config.logger;

var friend_helper = require("../../helpers/friend_helper");

/**
 * @api {get} /user/friend Get all
 * @apiName Get all
 * @apiGroup  User Friends
 * @apiHeader {String}  x-access-token User's unique access-key
 * @apiSuccess (Success 200) {Array} friends Array of friends document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  logger.trace("Get all friends API called");
  var resp_data = await friend_helper.get_friends({
	userId: authUserId,
	
  });
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching friend = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
	logger.trace("friend got successfully = ", resp_data);
	
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {get} /user/friend/request_id Get by ID
 * @apiName Get by ID
 * @apiGroup  User Friends
 * @apiHeader {String}  x-access-token User's unique access-key
 * @apiSuccess (Success 200) {Array} friend Array of friends document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:request_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  request_id = req.params.request_id;
  logger.trace("Get all friend API called");
  var resp_data = await friend_helper.get_shopping_cart_id({
    _id: request_id,
    userId: authUserId
  });
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching friend = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("friend got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /user/friend Send request
 * @apiName Send request
 * @apiGroup  User Friends
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token User's unique access-key
 * @apiParam {String} friendId Id fo friend
 * @apiSuccess (Success 200) {JSON} friend request sent in friends detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var schema = {
    friendId: {
      notEmpty: true,
      errorMessage: "friendId is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var friend_obj = {
      friendId: req.body.friendId,
      status: 1,
      userId: authUserId
    };

    let friend_data = await friend_helper.send_friend_request(friend_obj);
    if (friend_data.status === 0) {
      logger.error("Error while inserting friend request = ", friend_data);
      return res.status(config.BAD_REQUEST).json({ friend_data });
    } else {
      return res.status(config.OK_STATUS).json(friend_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.BAD_REQUEST).json({ message: errors });
  }
});

/**
 * @api {put} /user/friend  Approve request
 * @apiName Approve request
 * @apiGroup  User Friends
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token User's unique access-key
 * @apiSuccess (Success 200) {JSON} friend approved friend detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:request_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var request_id = req.params.request_id;

  var friend_obj = {
    status: 2
  };

  let friend_data = await friend_helper.approve_friend(
    { _id: request_id, userId: authUserId },
    friend_obj
  );
  if (friend_data.status === 0) {
    logger.error("Error while approving friend request = ", friend_data);
    return res.status(config.BAD_REQUEST).json({ friend_data });
  } else {
    return res.status(config.OK_STATUS).json(friend_data);
  }
});

/**
 * @api {delete} /user/friend/:request_id Delete request
 * @apiName Delete request
 * @apiGroup  User Friends
 *
 * @apiHeader {String}  x-access-token User's unique access-key
 *
 * @apiSuccess (Success 200) {String} Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:request_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  logger.trace("Delete friend API - Id = ", req.params.request_id);
  let friend_data = await friend_helper.reject_friend({
    _id: req.params.request_id,
    userId: authUserId
  });

  if (friend_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(friend_data);
  } else {
    res.status(config.OK_STATUS).json(friend_data);
  }
});

module.exports = router;
