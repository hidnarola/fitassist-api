var express = require("express");
var async = require("async");
var jwtDecode = require("jwt-decode");
var router = express.Router();
var config = require("../../config");
var logger = config.logger;
var notification_helper = require("../../helpers/notification_helper");

/**
 * @api {get} /user/notification/all/:skip?/:limit?/:sort? Get all Notification
 * @apiName  Get Notification
 * @apiGroup  User Notification
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {JSON} notifications Array of notifications document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/all/:skip?/:limit?/:sort?", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var obj = {
    "receiver.authUserId": authUserId
  };
  var skip = parseInt(req.params.skip ? req.params.skip : 0);
  var limit = parseInt(req.params.limit ? req.params.limit : 10);
  var sort = parseInt(req.params.sort ? req.params.sort : -1);
  var resp_data = await notification_helper.get_notifications(obj, {
    $skip: skip
  }, {
      $limit: limit
    }, {
      $sort: {
        _id: sort
      }
    });

  if (resp_data.status === 1) {
    resp_data.total_records = 0;
    var count = await notification_helper.get_notifications_count(obj);
    if (count && count.status === 1) {
      resp_data.total_records = count.count
    }
    logger.trace("notifications got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  } else {
    logger.error("Error occured while fetching notifications = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  }
});

/**
 * @api {get} /user/notification/:type? Get Notification
 * @apiName  Get Notification
 * @apiGroup  User Notification
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {JSON} notifications Array of notifications document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:type/:skip?/:limit?", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var obj = {
    "receiver.authUserId": authUserId,
    isSeen: 1
  };

  if (typeof req.params.type !== "undefined") {
    obj.isSeen = parseInt(req.params.type);
  }
  var skip = parseInt(req.params.skip ? req.params.skip : 0);
  var limit = parseInt(req.params.limit ? req.params.limit : 10);

  var resp_data = await notification_helper.get_notifications(obj, {
    $skip: skip
  }, {
      $limit: limit
    });

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
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  let notification_data = await notification_helper.notification_seen({
    "receiver.authUserId": authUserId
  }, {
      isSeen: 1
    });
  if (notification_data.status === 0) {
    logger.error(
      "Error while mark as read notifications = ",
      notification_data
    );
    return res.status(config.BAD_REQUEST).json({
      notification_data
    });
  } else {
    return res.status(config.OK_STATUS).json(notification_data);
  }
});

/**
 * @api {put} /user/notification/:notification_id Make Notification as Read
 * @apiName Make Notification as Read
 * @apiGroup  User Notification
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:notification_id?", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  let notification_data = await notification_helper.notification_seen({
    _id: req.params.notification_id
  }, {
      isSeen: 1
    });
  if (notification_data.status === 0) {
    logger.error("Error while mark as read notification = ", notification_data);
    return res.status(config.BAD_REQUEST).json({
      notification_data
    });
  } else {
    return res.status(config.OK_STATUS).json(notification_data);
  }
});

module.exports = router;