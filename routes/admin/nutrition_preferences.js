var express = require("express");
var router = express.Router();
var config = require("../../config");
var logger = config.logger;
var nutrition_preferences_helper = require("../../helpers/nutrition_preferences_helper");

/**
 * @api {get} /admin/nutrition_preferences Get all
 * @apiName Get all
 * @apiGroup Nutrition Preferences
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} nutrition_preferences Array of nutrition_preferences 's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  logger.trace("Get all nutrition_preferences API called");
  var resp_data = await nutrition_preferences_helper.get_all_nutrition_preferences();
  if (resp_data.status == 0) {
    logger.error(
      "Error occured while fetching nutrition preferences = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("Nutrition Preferences got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {get} /admin/nutrition_preferences/:nutrition_preferences_id Get by ID
 * @apiName Get by ID
 * @apiGroup Nutrition Preferences
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} nutrition_preference nutrition_preferences's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:nutrition_preferences_id", async (req, res) => {
  logger.trace(
    "Get nutrition preference by ID API called : ",
    req.params.nutrition_preferences_id
  );
  var resp_data = await nutrition_preferences_helper.get_nutrition_preference_by_id({
    _id: req.params.nutrition_preferences_id
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
 * @api {post} /admin/nutrition_preferences Add
 * @apiName Add
 * @apiGroup Nutrition Preferences
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} userId userId of User
 * @apiParam {Enum-Array} dietaryRestrictedRecipieTypes | Possible Values ('pescaterian','paleo','vegetarian','vegan','dairy-free','kosher','islam','coeliac')
 * @apiParam {Enum-Array} recipieDifficulty recipieDifficulty level |  Possible Values ('easy', 'medium', 'hard')
 * @apiParam {Array} nutritionTargets nutritionTargets  [title:{title},start:{start value},end:{end value}]
 * @apiParam {Array} maxRecipieTime Description [{dayDrive : enum, time : 'value'}] | Possible Values ("breakfast", "lunch", "dinner","Snacks")
 * @apiSuccess (Success 200) {JSON} nutrition_preference nutrition_preference details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  var schema = {
    userId: {
      notEmpty: true,
      errorMessage: "User ID is required"
    }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {
    var nutrition_preference_obj = {
      userId: req.body.userId,
      dietaryRestrictedRecipieTypes: req.body.dietaryRestrictedRecipieTypes ?
        JSON.parse(req.body.dietaryRestrictedRecipieTypes) : null,
      recipieDifficulty: req.body.recipieDifficulty ?
        req.body.recipieDifficulty : null,
      maxRecipieTime: req.body.maxRecipieTime ?
        JSON.parse(req.body.maxRecipieTime) : null,
      nutritionTargets: req.body.nutritionTargets ?
        JSON.parse(req.body.nutritionTargets) : null,
      excludeIngredients: req.body.excludeIngredients ?
        JSON.parse(req.body.excludeIngredients) : null
    };

    let nutrition_preference_data = await nutrition_preferences_helper.insert_nutrition_preference(
      nutrition_preference_obj
    );
    if (nutrition_preference_data.status === 0) {
      logger.info("Successfully inserted nutrition preference = ", nutrition_preference_data);
      res.status(config.OK_STATUS).json(nutrition_preference_data);
    } else {
      logger.error("Error while inserting nutrition preference = ", nutrition_preference_data);
      res.status(config.INTERNAL_SERVER_ERROR).json({
        nutrition_preference_data
      });
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

/**
 * @api {put} /admin/nutrition_preferences/:nutrition_preferences_id Update
 * @apiName Update
 * @apiGroup Nutrition Preferences
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} userId userId of User
 * @apiParam {Enum-Array} dietaryRestrictedRecipieTypes | Possible Values ('pescaterian','paleo','vegetarian','vegan','dairy-free','kosher','islam','coeliac')
 * @apiParam {Enum-Array} recipieDifficulty recipieDifficulty level |  Possible Values ('easy', 'medium', 'hard')
 * @apiParam {Array} nutritionTargets nutritionTargets  [title:{title},start:{start value},end:{end value}]
 * @apiParam {Array} maxRecipieTime Description [{dayDrive : enum, time : 'value'}] | Possible Values ("breakfast", "lunch", "dinner","Snacks")
 * @apiSuccess (Success 200) {JSON} nutrition_preference nutrition_preference details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:nutrition_preferences_id", async (req, res) => {
  var schema = {
    userId: {
      notEmpty: true,
      errorMessage: "User ID is required"
    }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {
    var nutrition_preference_obj = {
      userId: req.body.userId,
      dietaryRestrictedRecipieTypes: req.body.dietaryRestrictedRecipieTypes ?
        JSON.parse(req.body.dietaryRestrictedRecipieTypes) : null,
      recipieDifficulty: req.body.recipieDifficulty ?
        req.body.recipieDifficulty : null,
      maxRecipieTime: req.body.maxRecipieTime ?
        JSON.parse(req.body.maxRecipieTime) : null,
      nutritionTargets: req.body.nutritionTargets ?
        JSON.parse(req.body.nutritionTargets) : null,
      excludeIngredients: req.body.excludeIngredients ?
        JSON.parse(req.body.excludeIngredients) : null,
      modifiedAt: new Date()
    };

    if (req.body.description) {
      nutrition_obj.description = req.body.description;
    }

    let nutrition_predata_data = await nutrition_preferences_helper.update_nutrition_preference_by_id(
      req.params.nutrition_preferences_id,
      nutrition_preference_obj
    );
    if (nutrition_predata_data.status === 0) {
      logger.error(
        "Error while updating nutrition preference = ",
        nutrition_predata_data
      );
      res.status(config.BAD_REQUEST).json({
        nutrition_predata_data
      });
    } else {
      res.status(config.OK_STATUS).json(nutrition_predata_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

/**
 * @api {delete} /admin/nutrition_preferences/:nutrition_preferences_id Delete
 * @apiName Delete
 * @apiGroup Nutrition Preferences
 *
 * @apiHeader {String}  x-access-token Admin's unique access-key
 *
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:nutrition_preferences_id", async (req, res) => {
  logger.trace(
    "Delete Nutrition Preference API - Id = ",
    req.params.nutrition_preferences_id
  );
  let nutrition_predata_data = await nutrition_preferences_helper.delete_nutrition_preference_by_id(
    req.params.nutrition_preferences_id
  );

  if (nutrition_predata_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(nutrition_predata_data);
  } else {
    res.status(config.OK_STATUS).json(nutrition_predata_data);
  }
});

module.exports = router;