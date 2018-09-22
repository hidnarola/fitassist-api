var express = require("express");
var router = express.Router();
var config = require("../../config");
var logger = config.logger;
var jwtDecode = require("jwt-decode");
var user_equipment_helper = require("../../helpers/user_equipment_helper");

/**
 * @api {get} /user/equipment Get User's all Equipment
 * @apiName Get all User's Equipment
 * @apiGroup User Equipment
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {JSON} equipments Array of equipments document.
 * <pre><code>Response Data: <br>{<br>
    "status": 1,<br>
    "message": "Record founds",<br>
    "equipments": {<br>
        "user_equipments": {},<br>
        "all_equipments": []<br>
    }<br>}</code></pre>
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
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
  } else if (resp_data.status == 2) {
    user_equipment_obj.equipments.user_equipments = [];
  } else {
    user_equipment_obj.equipments.user_equipments = resp_data.user_equipments.equipmentIds;
  }
  var all_equipments_data = await user_equipment_helper.get_all_equipment();
  user_equipment_obj.equipments.all_equipments =
    all_equipments_data.equipments;
  logger.trace("user equipments got successfully = ", user_equipment_obj);
  res.status(config.OK_STATUS).json(user_equipment_obj);

});


/**
 * @api {post} /user/equipment/ Save User Equipment
 * @apiName Save Equipment
 * @apiGroup User Equipment
 * @apiDescription Save User Equipment API is for save and update User Equipment. if record is exists it would update else insert.
 * @apiHeader {String}  authorization user's unique access-key
 * @apiParam {String[]} equipmentIds equipmentIds of equipments
 * @apiSuccess (Success 200) {JSON} user_equipments Array of user's equipments document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var user_equipment_obj = {
    userId: authUserId,
    equipmentIds: req.body.equipmentIds
  };

  var resp_data = await user_equipment_helper.get_all_user_equipment(
    authUserId
  );
  if (resp_data.status == 2) {
    let user_equipment_data = await user_equipment_helper.insert_user_equipment(
      user_equipment_obj
    );
    if (user_equipment_data.status === 0) {
      logger.error(
        "Error while inserting user equipments = ",
        user_equipment_data
      );
      res.status(config.BAD_REQUEST).json({
        user_equipment_data
      });
    } else {
      res.status(config.OK_STATUS).json(user_equipment_data);
    }
  } else if (resp_data.status == 1) {
    let user_equipment_data = await user_equipment_helper.update_user_equipment(
      authUserId,
      user_equipment_obj
    );
    if (user_equipment_data.status === 0) {
      logger.error(
        "Error while inserting user equipments = ",
        user_equipment_data
      );
      res.status(config.BAD_REQUEST).json({
        user_equipment_data
      });
    } else {
      res.status(config.OK_STATUS).json(user_equipment_data);
    }
  } else {
    return res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  }
});



module.exports = router;