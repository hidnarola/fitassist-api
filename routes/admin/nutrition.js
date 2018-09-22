var express = require("express");
var router = express.Router();
var config = require("../../config");
var logger = config.logger;
var nutrition_helper = require("../../helpers/nutrition_helper");

/**
 * @api {get} /admin/nutrition Get all
 * @apiName Get all
 * @apiGroup Nutrition
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} nutritions Array of nutrition's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  logger.trace("Get all nutrition API called");
  var resp_data = await nutrition_helper.get_all_nutrition();
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching nutrition = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("Nutrition got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {get} /admin/nutrition/:nutrition_id Get by ID
 * @apiName Get by ID
 * @apiGroup Nutrition
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Object} nutrition nutrition's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:nutrition_id", async (req, res) => {
  logger.trace("Get nutrition by ID API called : ", req.params.nutrition_id);
  var resp_data = await nutrition_helper.get_nutrition_by_id(
    req.params.nutrition_id
  );
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching nutrition = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("Nutrition got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /admin/nutrition Add
 * @apiName Add
 * @apiGroup Nutrition
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} name Name of nutrition
 * @apiParam {String} [description] Description of nutrition
 * @apiSuccess (Success 200) {JSON} nutrition Nutrition details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  var schema = {
    name: {
      notEmpty: true,
      errorMessage: "Name is required"
    }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {
    var nutrition_obj = {
      name: req.body.name,
      description: req.body.description ? req.body.description : null
    };

    let nutrition_data = await nutrition_helper.insert_nutrition(nutrition_obj);
    if (nutrition_data.status === 0) {
      logger.error("Error while inserting nutrition = ", nutrition_data);
      res.status(config.BAD_REQUEST).json({
        nutrition_data
      });
    } else {
      res.status(config.OK_STATUS).json(nutrition_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

/**
 * @api {put} /admin/nutrition/:nutrition_id Update
 * @apiName Update
 * @apiGroup Nutrition
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} name Nutrition name
 * @apiParam {String} description Nutrition descruption
 * @apiSuccess (Success 200) {JSON} nutrition Nutrition details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:nutrition_id", async (req, res) => {
  var schema = {
    name: {
      notEmpty: true,
      errorMessage: "Name is required"
    }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {
    var nutrition_obj = {
      name: req.body.name,
      modifiedAt: new Date()
    };

    if (req.body.description) {
      nutrition_obj.description = req.body.description;
    }

    let nutrition_data = await nutrition_helper.update_nutrition_by_id(
      req.params.nutrition_id,
      nutrition_obj
    );
    if (nutrition_data.status === 0) {
      logger.error("Error while updating nutrition = ", nutrition_data);
      res.status(config.BAD_REQUEST).json({
        nutrition_data
      });
    } else {
      res.status(config.OK_STATUS).json(nutrition_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }

  req.checkBody(schema);
  req.getValidationResult().then(function (result) {
    if (result.isEmpty()) {
      var obj = {
        question: req.body.question,
        answer: req.body.answer,
        category_id: req.body.category_id
      };
      if (req.body.is_active && req.body.is_active != null) {
        obj.is_active = req.body.is_active;
      }
      nutrition_helper.update_nutrition_by_id(req.body.id, obj, function (resp) {
        if (resp.status == 0) {
          res.status(config.INTERNAL_SERVER_ERROR).json({
            error: resp.err
          });
        } else {
          res
            .status(config.OK_STATUS)
            .json({
              message: "Nutrition has been updated successfully"
            });
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
 * @api {delete} /admin/nutrition/:nutrition_id Delete
 * @apiName Delete
 * @apiGroup Nutrition
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:nutrition_id", async (req, res) => {
  logger.trace("Delete Nutrition API - Id = ", req.params.nutrition_id);
  let nutrition_data = await nutrition_helper.delete_nutrition_by_id(
    req.params.nutrition_id
  );

  if (nutrition_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(nutrition_data);
  } else {
    res.status(config.OK_STATUS).json(nutrition_data);
  }
});

module.exports = router;