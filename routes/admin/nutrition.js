var express = require('express');
var router = express.Router();

var config = require('../../config');
var logger = config.logger;

var nutrition_helper = require('../../helpers/nutrition_helper');

/**
 * @api {get} / Nutrition - Get all
 * @apiName Nutrition - Get all
 * @apiGroup Admin
 * 
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * 
 * @apiSuccess (Success 200) {Array} nutritions Array of nutrition's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get('/', async (req, res) => {
    var resp_data = await nutrition_helper.get_all_nutrition();
    if(resp_data.status == 0){
        res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    } else {
        res.status(config.OK_STATUS).json(resp_data);
    }
});

/**
 * @api {post} /admin/nutrition Nutrition Add
 * @apiName Nutrition Add
 * @apiGroup Admin
 * 
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * 
 * @apiParam {String} name Name of nutrition
 * @apiParam {String} [description] Description of nutrition
 * 
 * @apiSuccess (Success 200) {JSON} nutrition Nutrition details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post('/', async (req, res) => {
    var schema = {
        "name": {
            notEmpty: true,
            errorMessage: "Name is required"
        }
    };

    req.checkBody(schema);
    var errors = req.validationErrors();
    if (!errors) {
        var nutrition_obj = {
            "name": req.body.name,
            "description": (req.body.description) ? req.body.description : null
        };

        let nutrition_data = await nutrition_helper.insert_nutrition(nutrition_obj);
        if (nutrition_data.status === 0) {
            logger.error("Error while inserting nutrition = ", nutrition_data);
            res.status(config.BAD_REQUEST).json({ nutrition_data });
        } else {
            res.status(config.OK_STATUS).json(nutrition_data);
        }
    } else {
        logger.error("Validation Error = ", errors);
        res.status(config.BAD_REQUEST).json({ message: errors });
    }
});

/**
 * @api {put} /nutrition/:nutrition_id Nutrition Update
 * @apiName Nutrition Update
 * @apiGroup Admin
 * 
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * 
 * @apiParam {String} name Nutrition name
 * @apiParam {String} description Nutrition descruption
 * 
 * @apiSuccess (Success 200) {JSON} nutrition Nutrition details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put('/:nutrition_id', async (req, res) => {
    var schema = {
        "name": {
            notEmpty: true,
            errorMessage: "Name is required"
        }
    };

    req.checkBody(schema);
    var errors = req.validationErrors();
    if (!errors) {
        var nutrition_obj = {
            "name": req.body.name,
        };

        if (req.body.description) {
            nutrition_obj.description = req.body.description;
        }

        let nutrition_data = await nutrition_helper.update_nutrition_by_id(req.params.nutrition_id, nutrition_obj);
        if (nutrition_data.status === 0) {
            logger.error("Error while updating nutrition = ", nutrition_data);
            res.status(config.BAD_REQUEST).json({ nutrition_data });
        } else {
            res.status(config.OK_STATUS).json(nutrition_data);
        }
    } else {
        logger.error("Validation Error = ", errors);
        res.status(config.BAD_REQUEST).json({ message: errors });
    }

    req.checkBody(schema);
    req.getValidationResult().then(function (result) {
        if (result.isEmpty()) {
            var obj = {
                'question': req.body.question,
                'answer': req.body.answer,
                'category_id': req.body.category_id
            };
            if (req.body.is_active && req.body.is_active != null) {
                obj.is_active = req.body.is_active;
            }
            nutrition_helper.update_nutrition_by_id(req.body.id, obj, function (resp) {
                if (resp.status == 0) {
                    res.status(config.INTERNAL_SERVER_ERROR).json({ "error": resp.err });
                } else {
                    res.status(config.OK_STATUS).json({ "message": "Nutrition has been updated successfully" });
                }
            });
        } else {
            var result = {
                message: "Validation Error",
                error: result.array()
            };
            res.status(config.VALIDATION_FAILURE_STATUS).json(result);
        }
    });
});

/**
 * @api {delete} /nutrition/:nutrition_id Nutrition Delete
 * @apiName Nutrition Delete 
 * @apiGroup Admin
 * 
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * 
 * @apiSuccess (Success 200) {String} Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete('/:nutrition_id', async (req, res) => {
    logger.trace("Delete Nutrition API - Id = ", req.query.id);
    let nutrition_data = await nutrition_helper.delete_nutrition_by_id(req.params.nutrition_id);

    if (nutrition_data.status === 0) {
        res.status(config.INTERNAL_SERVER_ERROR).json(nutrition_data);
    } else {
        res.status(config.OK_STATUS).json(nutrition_data);
    }
});

module.exports = router;