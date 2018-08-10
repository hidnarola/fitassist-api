var express = require("express");
var router = express.Router();
var config = require("../../config");
var jwtDecode = require("jwt-decode");

var logger = config.logger;

var badge_assign_helper = require("../../helpers/badge_assign_helper");
var badge_helper = require("../../helpers/badge_helper");

/**
 * @api {get} /user/badge/:start/:limit Get all
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
      $sort: {
        createdAt: -1
      }
    });
  } else if (type === "incompleted") {
    var resp_data = await badge_helper.get_badges();
    console.log('------------------------------------');
    console.log('resp_data: ', resp_data);
    console.log('------------------------------------');

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