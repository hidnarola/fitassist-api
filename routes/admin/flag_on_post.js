var express = require("express");
var mongoose = require("mongoose");
var jwtDecode = require("jwt-decode");
var router = express.Router();
var config = require("../../config");
var logger = config.logger;
var flag_on_post_helper = require("../../helpers/flag_on_post_helper");

/**
 * @api {get} /admin/flag_on_post Get all Flags
 * @apiName Get all Flags
 * @apiGroup  Admin Post Flag
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization admin's unique x-access-token
 * @apiSuccess (Success 200) {JSON} flags detail of flag on post
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  let flag_data = await flag_on_post_helper.get_all_flags();
  if (flag_data.status === 1) {
    logger.trace("Admin Succesfully Get all flags = ", flag_data);
    return res.status(config.OK_STATUS).json(flag_data);
  } else {
    logger.error("Error while fetching flag at admin = ", flag_data);
    return res.status(config.INTERNAL_SERVER_ERROR).json({
      flag_data
    });
  }
});

module.exports = router;