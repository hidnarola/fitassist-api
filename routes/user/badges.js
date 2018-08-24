var express = require("express");
var _ = require("underscore");
var router = express.Router();
var config = require("../../config");
var jwtDecode = require("jwt-decode");
var mongoose = require("mongoose")

var logger = config.logger;

var badge_assign_helper = require("../../helpers/badge_assign_helper");
var badge_helper = require("../../helpers/badge_helper");

/**
 * @api {get} /user/badge/:type Get all
 * @apiName Get all
 * @apiGroup User Badges
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {JSON} badges JSON of badges_assign's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:type", async (req, res) => {
  logger.trace("Get all user's badges API called");

  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var resp_data = null;

  var type = req.params.type;
  if (type === "tracking") {
    resp_data = await badge_helper.get_badges_group_by();

  } else if (type === "complete") {
    resp_data = await badge_assign_helper.get_all_badges({
      userId: authUserId
    }, {
      createdAt: -1
    });
    console.log('------------------------------------');
    console.log('complete resp_data : ', resp_data);
    console.log('------------------------------------');

  } else if (type === "incomplete") {
    resp_data = await badge_assign_helper.get_all_badges({
      userId: authUserId
    });
    console.log('------------------------------------');
    console.log('incomplete resp_data : ', resp_data);
    console.log('------------------------------------');
    if (resp_data.status === 1) {
      var completedBadgesIds = [];
      for (let x of resp_data.badges) {
        completedBadgesIds.push(x.badgeId);
      }

      resp_data = await badge_helper.get_badges({
        _id: {
          $nin: completedBadgesIds
        }
      });
    }
  }

  if (resp_data && resp_data.status === 1) {
    logger.trace("user badges found   = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  } else {
    logger.error(
      "Error occured while fetching user badges = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  }
});

module.exports = router;