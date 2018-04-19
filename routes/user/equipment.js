var express = require("express");
var fs = require("fs");
var path = require("path");

var router = express.Router();

var config = require("../../config");
var logger = config.logger;
var jwtDecode = require("jwt-decode");
var user_equipment_helper = require("../../helpers/user_equipment_helper");
var equipment_helper = require("../../helpers/equipment_helper");

/**
 * @api {get} /user/equipment/auth_user_id Get all User Equipment
 * @apiName Get all Equipment
 * @apiGroup User Equipment
 *
 * @apiHeader {String}  x-access-token user's unique access-key
 *
 * @apiSuccess (Success 200) {Array} user_equipments Array of equipments document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  if (req.headers["authorization"]) {
    var decoded = jwtDecode(req.headers["authorization"]);
  } else {
    return res.status(config.UNAUTHORIZED).json({
      message: "authorization token missing"
    });
  }
  authUserId = decoded.sub;
  var user_equipment_obj = {
    status: 1,
    message: "Record founds",
    equipments: {
      user_equipments: {},
      all_equipments: []
    }
  };
  logger.trace("Get all User's equipments API called");
  var resp_data = await user_equipment_helper.get_all_user_equipment(
    authUserId
  );
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching user equipments = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    user_equipment_obj.equipments.user_equipments = resp_data.user_equipments;
    var all_equipments_data = await equipment_helper.get_all_equipment();
    user_equipment_obj.equipments.all_equipments =
      all_equipments_data.equipments;
    logger.trace("user equipments got successfully = ", user_equipment_obj);
    res.status(config.OK_STATUS).json(user_equipment_obj);
  }
});

/**
 * @api {post} /user/equipment/ Save User Equipment
 * @apiName Save Equipment
 * @apiGroup User Equipment
 *
 * @apiHeader {String}  x-access-token user's unique access-key
 * @apiParam {String[]} equipmentsId equipmentsId of equipments
 * @apiSuccess (Success 200) {Array} user_equipments Array of user's equipments document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  if (req.headers["authorization"]) {
    var decoded = jwtDecode(req.headers["authorization"]);
  } else {
    return res.status(config.UNAUTHORIZED).json({
      message: "authorization token missing"
    });
  }
  var authUserId = decoded.sub;

  var user_equipment_obj = {
    userId: authUserId,
    equipmentsId: req.body.equipmentsId
  };

  var resp_data = await user_equipment_helper.get_all_user_equipment(
    authUserId
  );
  if(resp_data.status==2)
  {
    let user_equipment_data = await user_equipment_helper.insert_user_equipment(user_equipment_obj);
    if (user_equipment_data.status === 0) {
        logger.error("Error while inserting user equipments = ", user_equipment_data);
        res.status(config.BAD_REQUEST).json({ user_equipment_data });
    } else {
        res.status(config.OK_STATUS).json(user_equipment_data);
    }  
  }
  else if(resp_data.status==1)
  {
    let user_equipment_data = await user_equipment_helper.update_user_equipment(user_equipment_obj);
    if (user_equipment_data.status === 0) {
        logger.error("Error while inserting user equipments = ", user_equipment_data);
        res.status(config.BAD_REQUEST).json({ user_equipment_data });
    } else {
        res.status(config.OK_STATUS).json(user_equipment_data);
    } 
  }
  else{
    
    console.log('error');
  }
 
});

module.exports = router;
