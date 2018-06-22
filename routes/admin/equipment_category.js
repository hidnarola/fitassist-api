var express = require("express");
var router = express.Router();

var config = require("../../config");
var logger = config.logger;

var equipment_category_helper = require("../../helpers/equipment_category_helper");

/**
 * @api {get} /admin/equipment_category Get all
 * @apiName Get all
 * @apiGroup Equipment category
 *
 * @apiHeader {String}  x-access-token Admin's unique access-key
 *
 * @apiSuccess (Success 200) {Array} equipment_categories Array of equipment's categories document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  logger.trace("Get all equipment_category API called");
  var resp_data = await equipment_category_helper.get_all_equipment_category();
  if (resp_data.status == 0) {
    logger.error(
      "Error occured while fetching equipment_category = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("Equipment category got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /admin/equipment_category Add
 * @apiName  Add
 * @apiGroup Equipment category
 *
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 *
 * @apiParam {String} name Name of equipment category
 * @apiParam {String} [description] Description of equipment category
 *
 * @apiSuccess (Success 200) {JSON} equipment_category Equipment category details
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
    var equipment_category_obj = {
      name: req.body.name,
      description: req.body.description ? req.body.description : null
    };

    let equipment_category_data = await equipment_category_helper.insert_equipment_category(
      equipment_category_obj
    );
    if (equipment_category_data.status === 0) {
      logger.error(
        "Error while inserting equipment_category = ",
        equipment_category_data
      );
      res.status(config.BAD_REQUEST).json({ equipment_category_data });
    } else {
      res.status(config.OK_STATUS).json(equipment_category_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({ message: errors });
  }
});

/**
 * @api {put} /admin/equipment_category/:equipment_category_id Update
 * @apiName Update
 * @apiGroup Equipment category
 *
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 *
 * @apiParam {String} name Equipment category name
 * @apiParam {String} description Equipment category description
 *
 * @apiSuccess (Success 200) {JSON} equipment_category Equipment category details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:equipment_category_id", async (req, res) => {
  var schema = {
    name: {
      notEmpty: true,
      errorMessage: "Name is required"
    }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {
    var equipment_category_obj = {
      name: req.body.name,
      modifiedAt: new Date()
    };

    if (req.body.description) {
      equipment_category_obj.description = req.body.description;
    }

    let equipment_category_data = await equipment_category_helper.update_equipment_category_by_id(
      req.params.equipment_category_id,
      equipment_category_obj
    );
    if (equipment_category_data.status === 0) {
      logger.error(
        "Error while updating equipment_category = ",
        equipment_category_data
      );
      res.status(config.BAD_REQUEST).json({ equipment_category_data });
    } else {
      res.status(config.OK_STATUS).json(equipment_category_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({ message: errors });
  }

  req.checkBody(schema);
  req.getValidationResult().then(function(result) {
    if (result.isEmpty()) {
      var obj = {
        question: req.body.question,
        answer: req.body.answer,
        category_id: req.body.category_id
      };
      if (req.body.is_active && req.body.is_active != null) {
        obj.is_active = req.body.is_active;
      }
      equipment_category_helper.update_equipment_category_by_id(
        req.body.id,
        obj,
        function(resp) {
          if (resp.status == 0) {
            res.status(config.INTERNAL_SERVER_ERROR).json({ error: resp.err });
          } else {
            res.status(config.OK_STATUS).json({
              message: "Equipment category has been updated successfully"
            });
          }
        }
      );
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
 * @api {delete} /admin/equipment_category/:equipment_category_id Delete
 * @apiName Delete
 * @apiGroup Equipment category
 *
 * @apiHeader {String}  x-access-token Admin's unique access-key
 *
 * @apiSuccess (Success 200) {String} Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:equipment_category_id", async (req, res) => {
  logger.trace(
    "Delete equipment category API - Id = ",
    req.params.equipment_category_id
  );
  let equipment_category_data = await equipment_category_helper.delete_equipment_category_by_id(
    req.params.equipment_category_id
  );

  if (equipment_category_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(equipment_category_data);
  } else {
    res.status(config.OK_STATUS).json(equipment_category_data);
  }
});

module.exports = router;
