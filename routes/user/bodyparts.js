var express = require("express");
var router = express.Router();

var config = require("../../config");
var logger = config.logger;

var body_part_helper = require("../../helpers/body_parts_helper");

/**
 * @api {get} /user/bodypart Get all
 * @apiName Get all
 * @apiGroup  User Body Parts
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {Array} bodyparts Array of bodyparts document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  logger.trace("Get all body parts API called");
  var resp_data = await body_part_helper.get_all_body_parts({
    isDeleted: 0
  });
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching body parts = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("Body Parts got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});
module.exports = router;