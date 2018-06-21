var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");
var jwtDecode = require("jwt-decode");

var router = express.Router();
var mongoose = require("mongoose");
var constant = require("../../constant");

var config = require("../../config");
var logger = config.logger;

var friend_helper = require("../../helpers/friend_helper");
var notification_helper = require("../../helpers/notification_helper");
var user_helper = require("../../helpers/user_helper");
var badge_assign_helper = require("../../helpers/badge_assign_helper");
var common_helper = require("../../helpers/common_helper");
var socket = require("../../socket/socketServer");

/**
 * @api {get} /user/friend/:username/:type? Get by Username
 * @apiName Get by Username
 * @apiGroup  User Friends
 * @apiDescription Get friends by Username second parameter is used to get by status of friend 1 for pending friends and 2 for approved friend
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {Array} friend Array of friends document
 * @apiExample Response
 *   "self": 1,
 *   "isFriend": 0,
 *   "status": 1,
 *   "message": " found",
 *   "friends": [
 *       {
 *       }
 *     ]
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:username?/:type?", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var friendStatus = parseInt(req.params.type ? req.params.type : 2);

  var userdata = await friend_helper.find({
    authUserId: authUserId
  });

  var username = userdata.friends.username;
  username = req.params.username ? req.params.username : username;
  userdata = await friend_helper.find({
    username: username
  });

  var returnObject = {
    self: 0,
    isFriend: 0
  };

  var userAuthId = userdata.friends.authUserId;
  if (userAuthId && typeof userAuthId !== "undefined") {
    if (userAuthId === authUserId) {
      returnObject.self = 1;
    } else {
      friendcount = await friend_helper.checkFriend({
        friendId: userAuthId,
        userId: authUserId,
        status: 2
      });

      if (friendcount.count == 1) {
        returnObject.isFriend = 1;
      } else {
        returnObject.isFriend = 0;
      }
    }
  }
  var resp_data = await friend_helper.get_friend_by_username(
    {
      username: username
    },
    friendStatus
  );

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
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} friendId Id of friend
 * @apiSuccess (Success 200) {JSON} friend request sent in friends detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var schema = {
    friendId: {
      notEmpty: true,
      errorMessage: "friendId is required to send friend request"
    }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    if (authUserId === req.body.friendId) {
      return res
        .status(config.BAD_REQUEST)
        .json({ message: "Can not send friend request yourself" });
    }

    check_friend_data = await friend_helper.checkFriend({
      $or: [
        { $and: [{ userId: authUserId }, { friendId: req.body.friendId }] },
        { $and: [{ userId: req.body.friendId }, { friendId: authUserId }] }
      ]
    });
    var msg = "is already friend";
    if (check_friend_data.status == 1) {
      if (check_friend_data.friends.length !== 0) {
        if (check_friend_data.friends[0].status == 1) {
          msg = "request is already in pending";
        }
        return res.status(config.BAD_REQUEST).json({ message: msg });
      }
    }

    var friend_obj = {
      userId: authUserId,
      friendId: req.body.friendId
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
    res.status(config.VALIDATION_FAILURE_STATUS).json({ message: errors });
  }
});

/**
 * @api {put} /user/friend/:request_id  Approve request
 * @apiName Approve request
 * @apiGroup  User Friends
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
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
  var checkfrd = await friend_helper.checkFriend({
    _id: mongoose.Types.ObjectId(req.params.request_id)
  });

  // if (checkfrd.status == 1 && checkfrd.friends[0].status == 2) {
  //   return res
  //     .status(config.OK_STATUS)
  //     .json({ status: 0, message: "already friend" });
  // }
  let friend_data = await friend_helper.approve_friend(
    { _id: req.params.request_id },
    friend_obj
  );
  if (friend_data.status === 0) {
    logger.error("Error while approving friend request = ", friend_data);
    return res.status(config.BAD_REQUEST).json({ friend_data });
  } else {
    var friend = await friend_helper.checkFriend({
      _id: mongoose.Types.ObjectId(req.params.request_id)
    });

    notificationObj = {
      senderId: friend.friends[0].friendId,
      receiverId: friend.friends[0].userId,
      type: constant.NOTIFICATION_MESSAGES.FRIEND_REQUEST.TYPE,
      bodyMessage: constant.NOTIFICATION_MESSAGES.FRIEND_REQUEST.MESSAGE
    };

    var notification_data = await common_helper.send_notification(
      notificationObj,
      socket
    );

    let receiver_data = await user_helper.get_user_by({
      authUserId: friend.friends[0].userId
    });

    let sender_data = await user_helper.get_user_by({
      authUserId: friend.friends[0].friendId
    });

    var receiver_data_friends = await friend_helper.get_friend_by_username(
      {
        username: receiver_data.user.username
      },
      2
    );
    var sender_data_friends = await friend_helper.get_friend_by_username(
      {
        username: sender_data.user.username
      },
      2
    );
    // badge_assign start;
    var senderBadges = await badge_assign_helper.badge_assign(
      authUserId,
      constant.BADGES_TYPE.PROFILE,
      {
        friends: sender_data_friends.friends.length
      }
    );
    //badge assign end

    var receiverBadges = await badge_assign_helper.badge_assign(
      receiver_data.user.authUserId,
      constant.BADGES_TYPE.PROFILE,
      {
        friends: receiver_data_friends.friends.length
      }
    );

    return res.status(config.OK_STATUS).json(friend_data);
  }
});

/**
 * @api {delete} /user/friend/:request_id Delete request
 * @apiName Delete request
 * @apiGroup  User Friends
 *
 * @apiHeader {String}  authorization User's unique access-key
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
    $or: [{ userId: authUserId }, { friendId: authUserId }]
  });

  if (friend_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(friend_data);
  } else {
    res.status(config.OK_STATUS).json(friend_data);
  }
});

module.exports = router;
