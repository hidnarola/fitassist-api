var express = require('express');
var router = express.Router();

var config = require('../../config');
var logger = config.logger;

var nutrition_preferences_helper = require('../../helpers/nutrition_preferences_helper');


/**
 * @api {get} /user/nutrition_preferences/:userid Get by User ID
 * @apiName Get by User ID
 * @apiGroup Nutrition Preferences
 * 
 * @apiHeader {String}  x-access-token user's unique access-key
 * 
 * @apiSuccess (Success 200) {Array} nutrition_preference nutrition_preferences's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get('/:userid', async (req, res) => {
    logger.trace("Get nutrition preference by ID API called : ",req.params.userid);
    var resp_data = await nutrition_preferences_helper.get_nutrition_preference_by_user_id(req.params.userid);
    if(resp_data.status == 0){
        logger.error("Error occured while fetching nutrition preference = ",resp_data)
        res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    } else {
        logger.trace("Nutrition Preference got successfully = ",resp_data);
        res.status(config.OK_STATUS).json(resp_data);
    }
});



/**
 * @api {put} /user/nutrition_preferences/:nutrition_preferences_id Update
 * @apiName Update
 * @apiGroup Nutrition Preferences
 * 
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token user's unique access-key
 * 
 * @apiParam {String} userId userId of User
 * @apiParam {Enum-Array} dietaryRestrictedRecipieTypes | Possible Values ('pescaterian','paleo','vegetarian','vegan','dairy-free','kosher','islam','coeliac')
 * @apiParam {Enum-Array} recipieDifficulty recipieDifficulty level |  Possible Values ('easy', 'medium', 'hard')
 * @apiParam {Array} nutritionTargets nutritionTargets  [title:{title},start:{start value},end:{end value}]
 * @apiParam {Array} maxRecipieTime Description [{dayDrive : enum, time : 'value'}] | Possible Values ("breakfast", "lunch", "dinner","Snacks")
 * 
 * @apiSuccess (Success 200) {JSON} nutrition_preference nutrition_preference details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put('/:nutrition_preferences_id', async (req, res) => {
    var schema = {
        "userId": {
            notEmpty: true,
            errorMessage: "User ID is required"
        }
    };

    req.checkBody(schema);
    var errors = req.validationErrors();
    if (!errors) {
        var nutrition_preference_obj = {
            "userId": req.body.userId,
            "dietaryRestrictedRecipieTypes": (req.body.dietaryRestrictedRecipieTypes) ? JSON.parse(req.body.dietaryRestrictedRecipieTypes) : null,
            "recipieDifficulty": (req.body.recipieDifficulty) ? req.body.recipieDifficulty : null,
            "maxRecipieTime": (req.body.maxRecipieTime) ? JSON.parse(req.body.maxRecipieTime) : null,
            "nutritionTargets": (req.body.nutritionTargets) ? JSON.parse(req.body.nutritionTargets) : null,
            "excludeIngredients": (req.body.excludeIngredients) ? JSON.parse(req.body.excludeIngredients) : null,

        };


        if (req.body.description) {
            nutrition_obj.description = req.body.description;
        }

        let nutrition_predata_data = await nutrition_preferences_helper.update_nutrition_preference_by_id(req.params.nutrition_preferences_id, nutrition_preference_obj);
        if (nutrition_predata_data.status === 0) {
            logger.error("Error while updating nutrition preference = ", nutrition_predata_data);
            res.status(config.BAD_REQUEST).json({ nutrition_predata_data });
        } else {
            res.status(config.OK_STATUS).json(nutrition_predata_data);
        }
    } else {
        logger.error("Validation Error = ", errors);
        res.status(config.BAD_REQUEST).json({ message: errors });
    }
});



module.exports = router;