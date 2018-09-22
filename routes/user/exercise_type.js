var express = require('express');
var router = express.Router();
var config = require('../../config');
var logger = config.logger;
var exercise_types_helper = require('../../helpers/exercise_types_helper');

/**
 * @api {get} /user/exercise_type Get all
 * @apiName Get all
 * @apiGroup User Exercise Type
 * @apiHeader {String}  authorization User's unique access-key
 * @apiSuccess (Success 200) {Array} exercise_types Array of exercise_types's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get('/', async (req, res) => {
    logger.trace("Get all Exercise_types API called");
    var resp_data = await exercise_types_helper.get_all_exercise_types();
    if(resp_data.status == 0){
        logger.error("Error occured while fetching exercise_types = ",resp_data)
        res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    } else {
        logger.trace("Exercise types got successfully = ",resp_data);
        res.status(config.OK_STATUS).json(resp_data);
    }
});



module.exports = router;