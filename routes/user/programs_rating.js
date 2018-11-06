var express = require("express");
var router = express.Router();
var config = require("../../config");
var logger = config.logger;
var programs_rating_helper = require("../../helpers/programs_rating_helper");

/**
 * @api {post} /user/programs_rating Save program rating
 * @apiName  Save Program Rating
 * @apiGroup  User Program Rating
 * @apiHeader {String} authorization User's unique access-key
 * @apiParam {String} programId
 * @apiParam {String} userId
 * @apiParam {Number} rating
 * @apiParam {String} comment
 * @apiSuccess (Success 200) {Object} object contains latest rating and status
 * @apiError (Error 4xx) {Object} object contains error and status
 */
router.post("/", async (req, res) => {
    var schema = {
        comment: {
            isLength: {
                errorMessage: 'Feedback should be less than 1000 chars',
                options: {
                    max: 1000
                }
            }
        },
        rating: {
            notEmpty: true,
            isInt: {
                errorMessage: 'Rating should be greater than 0',
                options: {
                    gt: 0
                }
            },
            errorMessage: "Rating are required"
        }
    };

    req.checkBody(schema);
    var errors = req.validationErrors();

    if (!errors) {
        let programs_rating = req.body;
        let data = await programs_rating_helper.save_program_rating(programs_rating);
        if (data && data.status === 1) {
            logger.trace("Programs Rating saved successfully = ", data);
            res.status(config.OK_STATUS).json(data);
        } else {
            logger.error("Error occured while saving Programs Rating = ", data);
            res.status(config.INTERNAL_SERVER_ERROR).json(data);
        }
    } else {
        logger.error("Validation Error = ", errors);
        res.status(config.VALIDATION_FAILURE_STATUS).json({
            message: errors
        });
    }

});

module.exports = router;