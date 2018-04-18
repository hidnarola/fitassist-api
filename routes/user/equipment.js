var express = require("express");
var fs = require("fs");
var path = require("path");


var router = express.Router();

var config = require("../../config");
var logger = config.logger;

var equipment_helper = require("../../helpers/equipment_helper");


/**
 * @api {get} /user/equipment Get all Equipment
 * @apiName Get all Equipment
 * @apiGroup User
 *
 * @apiHeader {String}  x-access-token user's unique access-key
 *
 * @apiSuccess (Success 200) {Array} equipments Array of equipments document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
    logger.trace("Get all equipment API called");
    var resp_data = await equipment_helper.get_all_equipment();
    if (resp_data.status == 0) {
      logger.error("Error occured while fetching equipment = ", resp_data);
      res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    } else {
      logger.trace("Equipments got successfully = ", resp_data);
      res.status(config.OK_STATUS).json(resp_data);
    }
  });

/**
 * @api {get} /user/equipment/equipment_id Get by ID
 * @apiName Get equipment by ID
 * @apiGroup Equipment
 *
 * @apiHeader {String}  x-access-token user's unique access-key
 * @apiSuccess (Success 200) {Object} equipment Object of equipment document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:equipment_id", async (req, res) => {
  equipment_id = req.params.equipment_id;
  logger.trace("Get all equipment API called");
  var resp_data = await equipment_helper.get_equipment_id(equipment_id);
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching equipment = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("Equipments got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

module.exports = router;
