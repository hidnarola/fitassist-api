var express = require('express');
var router = express.Router();

var config = require('../../config');
var logger = config.logger;

var exercise_types_helper = require('../../helpers/exercise_types_helper');

/**
 * @api {get} /admin/exercise_type Exercise Types - Get all
 * @apiName Exercise Type - Get all
 * @apiGroup Admin
 * 
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * 
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

/**
 * @api {post} /admin/exercise_type Exercise Types Add
 * @apiName Exercise Type Add
 * @apiGroup Admin
 * 
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * 
 * @apiParam {String} name Name of Exercise_types
 * @apiParam {String} description Description of Exercise types 
 * 
 * @apiSuccess (Success 200) {JSON} exercise_types Exercise types details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post('/', async (req, res) => {
    var schema = {
        "name": {
            notEmpty: true,
            errorMessage: "Name is required"
        },
        "description": {
            notEmpty: true,
            errorMessage: "Description is required"
        }
    };

    req.checkBody(schema);
    var errors = req.validationErrors();
    if (!errors) {
        var exercise_type_obj = {
            "name": req.body.name,
            "description": (req.body.description) ? req.body.description : null
        };

        let exercise_type_data = await exercise_types_helper.insert_exercise_type(exercise_type_obj);
        if (exercise_type_data.status === 0) {
            console.log('heyy');

            logger.error("Error while inserting Exercise type data = ", exercise_type_data);
            res.status(config.BAD_REQUEST).json({ exercise_type_data });
        } else {
            res.status(config.OK_STATUS).json(exercise_type_data);
        }
    } else {
        logger.error("Validation Error = ", errors);
        res.status(config.BAD_REQUEST).json({ message: errors });
    }
});

/**
 * @api {put} /admin/exercise_type/:exercise_type_id Exercise Type Update
 * @apiName Exercise Type Update
 * @apiGroup Admin
 * 
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * 
 * @apiParam {String} name Exercise type name
 * @apiParam {String} description Exercise type description
 * 
 * @apiSuccess (Success 200) {JSON} exercise_type Exercise Type details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put('/:exercise_type_id', async (req, res) => {    
    var schema = {
        "name": {
            notEmpty: true,
            errorMessage: "Name is required"
        },
        "description": {
            notEmpty: true,
            errorMessage: "Description is required"
        }
    };

    req.checkBody(schema);
    var errors = req.validationErrors();
    if (!errors) {
        var exercise_type_obj = {
            "name": req.body.name,
        };

        if (req.body.description) {
            exercise_type_obj.description = req.body.description;
        }

        let exercise_type_data = await exercise_types_helper.update_exercise_type_by_id(req.params.exercise_type_id, exercise_type_obj);
        if (exercise_type_data.status === 0) {
            logger.error("Error while updating exercise_type_data = ", exercise_type_data);
            res.status(config.BAD_REQUEST).json({ exercise_type_data });
        } else {
            res.status(config.OK_STATUS).json(exercise_type_data);
        }
    } else {
        logger.error("Validation Error = ", errors);
        res.status(config.BAD_REQUEST).json({ message: errors });
    }

});

/**
 * @api {delete} /admin/exercise_type/:exercise_type_id Exercise Type Delete
 * @apiName Exercise Type Delete 
 * @apiGroup Admin
 * 
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * 
 * @apiSuccess (Success 200) {String} Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete('/:exercise_type_id', async (req, res) => {
    logger.trace("Delete Exercise Type  API - Id = ", req.query.id);
    let exercise_type_data = await exercise_types_helper.delete_exercise_type_by_id(req.params.exercise_type_id);

    if (exercise_type_data.status === 0) {
        res.status(config.INTERNAL_SERVER_ERROR).json(exercise_type_data);
    } else {
        res.status(config.OK_STATUS).json(exercise_type_data);
    }
});

module.exports = router;