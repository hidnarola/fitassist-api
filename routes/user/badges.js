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


  var type = req.params.type;
  if (type === "tracking") {
    var resp_data = await badge_helper.get_badges();
  } else if (type === "completed") {
    var resp_data = await badge_assign_helper.get_all_badges({
      userId: authUserId
    }, {
      createdAt: -1
    });
  } else if (type === "incompleted") {

    var resp_data = await badge_assign_helper.get_all_badges({
      userId: authUserId
    });
    if (resp_data.status === 1) {
      var completedBadgesIds = [];
      console.log('------------------------------------');
      console.log('resp_data.badges : ', resp_data.badges);
      console.log('------------------------------------');



      console.log('------------------------------------');
      console.log('completedBadgesIds : ', completedBadgesIds);
      console.log('------------------------------------');

      resp_data = await badge_helper.get_badges({
        _id: {
          $nin: completedBadgesIds
        }
      });
      if (resp_data.status === 1) {

        console.log('------------------------------------');
        console.log('resp_data : ', resp_data.badges.length);
        console.log('------------------------------------');
      }
    }
  }

  if (resp_data.status == 0) {
    logger.error(
      "Error occured while fetching get all user personal goals = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user personal goals got   = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

module.exports = router;