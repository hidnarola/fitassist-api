var express = require('express');
var router = express.Router();

var config = require('../../config');
var logger = config.logger;

var exercise_helper = require('../../helpers/exercise_helper');


/**
 * @api {get} /user/exercise Get all
 * @apiName Get all
 * @apiGroup User Exercise 
 * @apiHeader {String}  x-access-token User's unique access-key
 * @apiSuccess (Success 200) {Array} exercise Array of exercise_types's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get('/', async (req, res) => {
    logger.trace("Get all Exercise API called");
    var resp_data = await exercise_helper.get_all_exercise_for_user();
    if(resp_data.status == 0){
        logger.error("Error occured while fetching exercise = ",resp_data)
        res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    } else {
        logger.trace("Exercise got successfully = ",resp_data);
        res.status(config.OK_STATUS).json(resp_data);
    }
});



module.exports = router;