var express = require("express");
var router = express.Router();

var config = require("../../config");
var logger = config.logger;

var equipment_category_helper = require("../../helpers/equipment_category_helper");
var common_helper = require("../../helpers/common_helper");

/**
 * @api {post} /admin/equipment_category/filter Filter
 * @apiName Filter
 * @apiDescription Request Object :<pre><code>{
  pageSize: 10,
  page: 0,
  columnFilter: [
    {
      id: "firstName",
      value: "mi"
    }
  ],
  columnSort: [
    {
      id: "firstName",
      value: true
    }
  ],
  columnFilterEqual: [
    {
      id: "email",
      value: "amc@narola.email"
    }
  ]
 * }</code></pre>
 * @apiGroup BodyPart
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {Object} columnFilter columnFilter Object for filter data
 * @apiParam {Object} columnSort columnSort Object for Sorting Data
 * @apiParam {Object} columnFilterEqual columnFilterEqual Object for select box
 * @apiParam {Number} pageSize pageSize
 * @apiParam {Number} page page number
 * @apiSuccess (Success 200) {JSON} filtered_equipment_categories filtered details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/filter", async (req, res) => {
  filter_object = common_helper.changeObject(req.body);
  let filtered_data = await equipment_category_helper.get_filtered_records(filter_object);
  if (filtered_data.status === 0) {
    logger.error("Error while fetching searched data = ", filtered_data);
    return res.status(config.BAD_REQUEST).json(filtered_data);
  } else {
    return res.status(config.OK_STATUS).json(filtered_data);
  }
});

/**
 * @api {get} /admin/equipment_category Get all
 * @apiName Get all
 * @apiGroup Equipment category
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} equipment_categories Array of equipment's categories document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  logger.trace("Get all equipment category API called");
  var resp_data = await equipment_category_helper.get_all_equipment_category({ isDeleted: 0 });
  if (resp_data.status == 0) {
    logger.error(
      "Error occured while fetching equipment category = ",
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
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} name Name of equipment category
 * @apiParam {String} [description] Description of equipment category
 * @apiSuccess (Success 200) {JSON} equipment_category Equipment category details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  var schema = {
    name: {
      notEmpty: true,
      isLength: {
        errorMessage: 'Name should be between 3 to 50 characters',
        options: {
          min: 3,
          max: 50
        }
      },
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

    if (equipment_category_data.status === 1) {
      logger.trace(
        "Successfully inserted equipment category = ",
        equipment_category_data
      );
      res.status(config.OK_STATUS).json(equipment_category_data);
    } else {
      res.status(config.BAD_REQUEST).json(equipment_category_data);
      logger.error(
        "Error while inserting equipment category = ",
        equipment_category_data
      );
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

/**
 * @api {put} /admin/equipment_category/:equipment_category_id Update
 * @apiName Update
 * @apiGroup Equipment category
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} name Equipment category name
 * @apiParam {String} description Equipment category description
 * @apiSuccess (Success 200) {JSON} equipment_category Equipment category details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:equipment_category_id", async (req, res) => {
  var schema = {
    name: {
      notEmpty: true,
      isLength: {
        errorMessage: 'Name should be between 3 to 50 characters',
        options: {
          min: 3,
          max: 50
        }
      },
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

    if (req.body.description && req.body.description.length > 0) {
      equipment_category_obj.description = req.body.description;
    }

    let equipment_category_data = await equipment_category_helper.update_equipment_category_by_id(
      req.params.equipment_category_id,
      equipment_category_obj
    );
    if (equipment_category_data.status === 0) {
      logger.error(
        "Error while updating equipment category = ",
        equipment_category_data
      );
      res.status(config.BAD_REQUEST).json({
        equipment_category_data
      });
    } else {
      logger.error(
        "Successfully updated equipment category = ",
        equipment_category_data
      );
      res.status(config.OK_STATUS).json(equipment_category_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

/**
 * @api {put} /admin/equipment_category/undo/:equipment_category_id Undo
 * @apiName Undo
 * @apiGroup Equipment category
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/undo/:equipment_category_id", async (req, res) => {
  logger.trace(
    "Undo equipment category API - Id = ",
    req.params.equipment_category_id
  );

  let equipment_category_data = await equipment_category_helper.update_equipment_category_by_id(
    req.params.equipment_category_id, {
      isDeleted: 0
    }
  );

  if (equipment_category_data.status == 0) {
    logger.error(
      "Error while updating equipment_category = ",
      equipment_category_data
    );
    res.status(config.BAD_REQUEST).json({
      equipment_category_data
    });
  } else {
    logger.error(
      "Successfully updated equipment category = ",
      equipment_category_data
    );
    res.status(config.OK_STATUS).json(equipment_category_data);
  }
});

/**
 * @api {delete} /admin/equipment_category/:equipment_category_id Delete
 * @apiName Delete
 * @apiGroup Equipment category
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:equipment_category_id", async (req, res) => {
  logger.trace(
    "Delete equipment category API - Id = ",
    req.params.equipment_category_id
  );
  let equipment_category_data = await equipment_category_helper.update_equipment_category_by_id(
    req.params.equipment_category_id, {
      isDeleted: 1
    }
  );

  if (equipment_category_data.status == 0) {
    logger.error(
      "failed to delete equipment category API - Id = ",
      req.params.equipment_category_id
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(equipment_category_data);
  } else {
    logger.trace(
      "successfully deleted equipment category API - Id = ",
      req.params.equipment_category_id
    );
    res.status(config.OK_STATUS).json(equipment_category_data);
  }
});


module.exports = router;