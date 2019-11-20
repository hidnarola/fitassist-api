var express = require("express");
var _ = require("underscore");
var router = express.Router();
var config = require("../../config");
var jwtDecode = require("jwt-decode");
var logger = config.logger;
var badge_assign_helper = require("../../helpers/badge_assign_helper");
var badge_helper = require("../../helpers/badge_helper");

/**
 * @api {get} /user/badge/:type Get all
 * @apiName Get all
 * @apiGroup User Badges
 * @apiParam type type of badges<code>Possible values complete,incomplete or tracking</code>
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
    resp_data = await badge_helper.get_badges_group_by(authUserId);
  } else if (type === "complete") {
    resp_data = await badge_assign_helper.get_all_badges({
      userId: authUserId
    });
  } else if (type === "incomplete") {
    resp_data = await badge_assign_helper.get_all_badges({
      userId: authUserId
    });
    if (resp_data.status === 1) {
      var completedBadgesIds = [];
      for (let x of resp_data.badges) {
        completedBadgesIds.push(x.badgeId);
      }
      resp_data = await badge_helper.get_badges({
        _id: {
          $nin: completedBadgesIds
        },
        // status: 1,
        // isDeleted: 0
        $and: [
          {
            isDeleted: 0
          },
          {
            status: 1
          }
        ]
      });
    }
  } else {
    logger.error("Invalid badge type = ", req.params.type);
    res.status(config.INTERNAL_SERVER_ERROR).json({
      status: 0,
      message: "Invalid badge type"
    });
  }

  if (resp_data && resp_data.status == 0) {
    logger.error("Error occured while fetching user badges = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user badges found   = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

router.post("/add_favourite_badges", async (req, res) => {
  logger.trace("Favourite user's badges API called");
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var schema = {
    badges_Id: {
      notEmpty: true,
      errorMessage: "badges_Id is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {
    var bdagesObj = {
      userId: authUserId,
      badgesId: req.body.badges_Id,
      isFavourite: req.body.isFavourite ? req.body.isFavourite : false
    };
    var check_badges = await badge_helper.check_favourite_badges_by_id(
      req.body.badges_Id
    );
    if (check_badges.status === 1) {
      var badgesId = check_badges.badgesId._id;
      var obj = {
        isFavourite: req.body.isFavourite
      };
      var update_data = await badge_helper.update_favourite_badges(
        badgesId,
        obj
      );
      if (update_data && update_data.status == 1) {
        var resp_data = await badge_helper.get_all_favourite_badges_by_userId(
          authUserId
        );
        logger.trace("favourite badges inserted   = ", update_data);
        res.status(config.OK_STATUS).json(resp_data);
      } else {
        logger.error(
          "Error occured while updating favourite badges = ",
          update_data
        );
        res.status(config.INTERNAL_SERVER_ERROR).json(update_data);
      }
    }
    if (check_badges.status === 2) {
      var resp_data = await badge_helper.add_favourite_badges(bdagesObj);
      if (resp_data && resp_data.status == 1) {
        var resp_data1 = await badge_helper.get_all_favourite_badges_by_userId(
          authUserId
        );
        logger.trace("favourite badges inserted   = ", resp_data);
        res.status(config.OK_STATUS).json(resp_data1);
      } else {
        logger.error(
          "Error occured while inserting favourite badges = ",
          resp_data
        );
        res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
      }
    }
  } else {
    logger.error("Validation Error = ", errors);
    return res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

router.post("/get_favourite_badges", async (req, res) => {
  logger.trace("get Favourite user's badges API called");
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  console.log("===========authUserId===========");
  console.log(authUserId);
  console.log("==========================");
  var resp_data = await badge_helper.get_all_favourite_badges_by_userId(
    authUserId
  );
  console.log("===========GET FAV BADGES===========");
  console.log(resp_data);
  console.log("==========================");
  if (resp_data && resp_data.status == 1) {
    logger.trace("favourite badges found   = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  } else {
    logger.error("Error occured while fetching favourite badges = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  }
});

module.exports = router;
