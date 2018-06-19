var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");
var jwtDecode = require("jwt-decode");

var router = express.Router();

var config = require("../../config");
var logger = config.logger;

var notification_helper = require("../../helpers/notification_helper");

/**
 * @api {get} /user/notification/:type? Get Notification
 * @apiName  Get Notification
 * @apiGroup  User Notification
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {JSON} notifications Array of notifications document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:type?", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var obj = {
    "receiver.authUserId": authUserId
  };

  if (typeof req.params.type !== "undefined") {
    obj.isSeen = parseInt(req.params.type);
  }

  var resp_data = await notification_helper.get_notifications(obj);

  if (resp_data.status == 0) {
    logger.error("Error occured while fetching notifications = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("notifications got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});
/**
 * @api {put} /user/notification Mark as read
 * @apiName Mark as read
 * @apiGroup  User Notification
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {String} Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  let notification_data = await notification_helper.notification_seen(
    {
      "receiver.authUserId": authUserId
    },
    {
      isSeen: 1
    }
  );
  if (notification_data.status === 0) {
    logger.error(
      "Error while mark as read notifications = ",
      notification_data
    );
    return res.status(config.BAD_REQUEST).json({ notification_data });
  } else {
    return res.status(config.OK_STATUS).json(notification_data);
  }
});

/**
 * @api {put} /user/notification/:notification_id Make Notification as Read
 * @apiName Make Notification as Read
 * @apiGroup  User Notification
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {String} Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:notification_id?", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  let notification_data = await notification_helper.notification_seen(
    {
      _id: req.params.notification_id
    },
    {
      isSeen: 1
    }
  );
  if (notification_data.status === 0) {
    logger.error("Error while mark as read notification = ", notification_data);
    return res.status(config.BAD_REQUEST).json({ notification_data });
  } else {
    return res.status(config.OK_STATUS).json(notification_data);
  }
});

module.exports = router;
