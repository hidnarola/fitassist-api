var express = require("express");
var router = express.Router();
var config = require("../../config");
var jwtDecode = require("jwt-decode");

var logger = config.logger;

var badge_assign_helper = require("../../helpers/badge_assign_helper");

/**
 * @api {get} /user/badge/:start/:limit Get all
 * @apiName Get all
 * @apiGroup User Badges
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {JSON} badges JSON of badges_assign's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:type/:start?/:limit?", async (req, res) => {
  logger.trace("Get all user's badges API called");

  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var start = parseInt(req.params.start ? req.params.start : 0);
  var limit = parseInt(req.params.limit ? req.params.limit : 10);
  var type = parseInt(req.params.type ? req.params.type : 1);

  var resp_data = await badge_assign_helper.get_all_badges(
    {
      userId: authUserId
    },
    { $skip: start },
    { $limit: limit },
    {
      $sort: {
        createdAt: -1
      }
    }
  );

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
