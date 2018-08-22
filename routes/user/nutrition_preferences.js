var express = require("express");
var router = express.Router();

var config = require("../../config");
var constant = require("../../constant");
var logger = config.logger;
var jwtDecode = require("jwt-decode");

var nutrition_preferences_helper = require("../../helpers/nutrition_preferences_helper");

/**
 * @api {get} /user/nutrition_preference Get by User ID
 * @apiName Get by User ID
 * @apiGroup User Nutrition Preference
 *
 * @apiHeader {String}  authorization user's unique access-key
 *
 * @apiSuccess (Success 200) {Array} nutrition_preference nutrition_preference's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  logger.trace("Get nutrition preference by ID API called : ", authUserId);
  var resp_data = await nutrition_preferences_helper.get_nutrition_preference_by_user_id({
    userId: authUserId
  });
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
 * @api {post} /user/nutrition_preference Save Nutrition Preference
 * @apiName Save
 * @apiGroup User Nutrition Preference
 * @apiDescription Add Nutrition Preference if not exists else update existing document
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization user's unique access-key
 * @apiParam {Enum-Array} dietRestrictionLabels dietRestrictionLabels 
 * @apiParam {Enum-Array} healthRestrictionLabels healthRestrictionLabels
 * @apiParam {Enum-Array} excludeIngredients excludeIngredients
 * @apiParam {Array} nutritionTargets nutritionTargets  [title:{title},start:{start value},end:{end value}]
 * @apiParam {Array} maxRecipeTime max Recipe Time <code>[{dayDrive : enum, time : 'value'}]</code> | Possible Values ("breakfast", "lunch", "dinner","Snacks")
 *
 * @apiSuccess (Success 200) {JSON} nutrition_preference nutrition_preference details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var nutrition_preference_obj = {
    userId: authUserId,
  };

  if (req.body.dietRestrictionLabels) {
    nutrition_preference_obj.dietRestrictionLabels = req.body.dietRestrictionLabels;
  }
  if (req.body.healthRestrictionLabels) {
    nutrition_preference_obj.healthRestrictionLabels = req.body.healthRestrictionLabels;
  }
  if (req.body.nutritionTargets) {
    nutrition_preference_obj.nutritionTargets = req.body.nutritionTargets;
  }
  if (req.body.maxRecipeTime) {
    nutrition_preference_obj.maxRecipeTime = req.body.maxRecipeTime;
  }
  if (req.body.excludeIngredients) {
    nutrition_preference_obj.excludeIngredients = req.body.excludeIngredients;
  }


  var resp_data = await nutrition_preferences_helper.get_nutrition_preference_by_id({
    userId: authUserId
  });
  if (resp_data.status == 1) {

    let nutrition_preference_data = await nutrition_preferences_helper.update_nutrition_preference_by_userid(
      authUserId,
      nutrition_preference_obj
    );
    if (nutrition_preference_data.status === 0) {
      logger.error(
        "Error while updating nutrition preferences = ",
        nutrition_preference_data
      );
      res.status(config.BAD_REQUEST).json({
        nutrition_preference_data
      });
    } else {
      res.status(config.OK_STATUS).json(nutrition_preference_data);
    }

  } else if (resp_data.status == 2) {
    let nutrition_preference_data = await nutrition_preferences_helper.insert_nutrition_preference(nutrition_preference_obj);
    if (nutrition_preference_data.status === 0) {
      logger.error("Error while inserting nutrition preferences = ", nutrition_preference_data);
      res.status(config.BAD_REQUEST).json({
        nutrition_preference_data
      });
    } else {
      res.status(config.OK_STATUS).json(nutrition_preference_data);
    }

  } else {
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  }


});

/**
 * @api {get} /user/nutrition_preference/reset Reset Nutrition Preference
 * @apiName Reset Nutrition Preference
 * @apiGroup User Nutrition Preference
 *
 * @apiHeader {String}  authorization user's unique access-key
 *
 * @apiSuccess (Success 200) {JSON} nutrition_preference nutrition_preference's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/reset", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  logger.trace("Reset Nutrition preference API called : ", authUserId);
  let nutrition_preference_data = await nutrition_preferences_helper.update_nutrition_preference_by_userid(
    authUserId,
    constant.NUTRITION_PREFERENCE_DEFUALT_VALUE
  );
  if (nutrition_preference_data.status === 1) {
    nutrition_preference_data.message = "Reset Nutrition preference";
    res.status(config.OK_STATUS).json(nutrition_preference_data);

  } else {
    logger.error(
      "Error while reseting Nutrition preferences = ",
      nutrition_preference_data
    );
    // nutrition_preference_data.message="could not reset Nutrition preference";
    nutrition_preference_data.message = "Reset Nutrition preference failed";

    res.status(config.BAD_REQUEST).json({
      nutrition_preference_data
    });
  }
});
module.exports = router;