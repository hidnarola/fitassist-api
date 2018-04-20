var express = require("express");
var router = express.Router();

var config = require("../../config");
var logger = config.logger;
var jwtDecode = require("jwt-decode");

var nutrition_preferences_helper = require("../../helpers/nutrition_preferences_helper");

/**
 * @api {get} /user/nutrition_preferences/:userid Get by User ID
 * @apiName Get by User ID
 * @apiGroup Nutrition Preferences
 *
 * @apiHeader {String}  authorization user's unique access-key
 *
 * @apiSuccess (Success 200) {Array} nutrition_preference nutrition_preferences's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  logger.trace("Get nutrition preference by ID API called : ", authUserId);
  var resp_data = await nutrition_preferences_helper.get_nutrition_preference_by_user_id(
    authUserId
  );
  if (resp_data.status == 0) {
    logger.error(
      "Error occured while fetching nutrition preference = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("Nutrition Preference got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /user/nutrition_preferences/save Update
 * @apiName Update
 * @apiGroup Nutrition Preferences
 *
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization user's unique access-key
 * @apiParam {Enum-Array} dietaryRestrictedRecipieTypes | Possible Values ('pescaterian','paleo','vegetarian','vegan','dairy-free','kosher','islam','coeliac')
 * @apiParam {Enum-Array} recipieDifficulty recipieDifficulty level |  Possible Values ('easy', 'medium', 'hard')
 * @apiParam {Array} nutritionTargets nutritionTargets  [title:{title},start:{start value},end:{end value}]
 * @apiParam {Array} maxRecipieTime Description [{dayDrive : enum, time : 'value'}] | Possible Values ("breakfast", "lunch", "dinner","Snacks")
 *
 * @apiSuccess (Success 200) {JSON} nutrition_preference nutrition_preference details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/save", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var nutrition_preference_obj = {
    userId: authUserId,
    dietaryRestrictedRecipieTypes: req.body.dietaryRestrictedRecipieTypes
      ? JSON.parse(req.body.dietaryRestrictedRecipieTypes)
      : null,
    recipieDifficulty: req.body.recipieDifficulty
      ? req.body.recipieDifficulty
      : null,
    maxRecipieTime: req.body.maxRecipieTime
      ? JSON.parse(req.body.maxRecipieTime)
      : null,
    nutritionTargets: req.body.nutritionTargets
      ? JSON.parse(req.body.nutritionTargets)
      : null,
    excludeIngredients: req.body.excludeIngredients
      ? JSON.parse(req.body.excludeIngredients)
      : null
  };

  if (req.body.description) {
    nutrition_obj.description = req.body.description;
  }

  var resp_data = await nutrition_preferences_helper.get_nutrition_preference_by_user_id(
    authUserId
  );
  console.log(resp_data);
  if (resp_data.status == 2) {

      let nutrition_preference_data = await nutrition_preferences_helper.insert_nutrition_preference(nutrition_preference_obj);
      if (nutrition_preference_data.status === 0) {
          logger.error("Error while inserting nutrition preference = ", nutrition_preference_data);
          res.status(config.BAD_REQUEST).json({ nutrition_preference_data });
      } else {
          res.status(config.OK_STATUS).json(nutrition_preference_data);
      }

  } else if (resp_data.status == 1) {
    let nutrition_predata_data = await nutrition_preferences_helper.update_nutrition_preference_by_userid(
      authUserId,
      nutrition_preference_obj
    );
    if (nutrition_predata_data.status === 0) {
      logger.error(
        "Error while updating nutrition preference = ",
        nutrition_predata_data
      );
      res.status(config.BAD_REQUEST).json({ nutrition_predata_data });
    } else {
      res.status(config.OK_STATUS).json(nutrition_predata_data);
    }
  } else {
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  }

  
});

module.exports = router;
