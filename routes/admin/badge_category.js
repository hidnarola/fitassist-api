var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");

var router = express.Router();

var config = require("../../config");
var logger = config.logger;

var badge_category_helper = require("../../helpers/badge_category_helper");
var common_helper = require("../../helpers/common_helper");


/**
 * @api {post} /admin/badge_category/filter Filter
 * @apiName Filter
 * @apiGroup Badge Category
 *
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 *
 * @apiParam {Object} columnFilter columnFilter Object for filter data
 * @apiParam {Object} columnSort columnSort Object for Sorting Data
 * @apiParam {Object} columnFilterEqual columnFilterEqual Object for select box
 * @apiParam {Number} pageSize pageSize
 * @apiParam {Number} page page number
 * @apiSuccess (Success 200) {JSON} filtered_badge_categories filtered details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/filter", async (req, res) => {
    filter_object = common_helper.changeObject(req.body);
    let filtered_data = await badge_category_helper.get_filtered_records(filter_object);
    if (filtered_data.status === 0) {
      logger.error("Error while fetching searched data = ", filtered_data);
      return res.status(config.BAD_REQUEST).json({ filtered_data });
    } else {
      return res.status(config.OK_STATUS).json(filtered_data);
    }
  });


/**
 * @api {get} /admin/badge_category Get all
 * @apiName Get all
 * @apiGroup  Badge Category
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} badge_categories Array of badge_category document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {

    logger.trace("Get all badge_categories API called");
    var resp_data = await badge_category_helper.get_badge_categories();
    if (resp_data.status == 0) {
      logger.error("Error occured while fetching  badge_categories = ", resp_data);
      res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    } else {
      logger.trace("badge_categories got successfully = ", resp_data);
      res.status(config.OK_STATUS).json(resp_data);
    }
  });

/**
 * @api {get} /admin/badge_category/badge_category_id Get by ID
 * @apiName Get Badge Category by ID
 * @apiGroup  Badge Category
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} badge_category Array of badge_category document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:badge_category_id", async (req, res) => {
    badge_category_id = req.params.badge_category_id;
  logger.trace("Get all badge_category API called");
  var resp_data = await badge_category_helper.get_badge_category_id(badge_category_id);
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching badge_category = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("badge_category got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /admin/badge_category  Add
 * @apiName Add
 * @apiGroup  Badge Category
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} name Name of badge_category
 * @apiSuccess (Success 200) {JSON} badge_category added badge_category detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/", async (req, res) => {
    var schema = {
        "name": {
            notEmpty: true,
            errorMessage: "badge name is required"
        }
    };
    req.checkBody(schema);
    var errors = req.validationErrors();
    
    if (!errors) {
        var badge_category_obj = {
            "name": req.body.name,
            };

            let badge_category_data = await badge_category_helper.insert_badge_category_part(badge_category_obj);
            if (badge_category_data.status === 0) {
                logger.error("Error while inserting badge_category data = ", badge_category_data);
                return res.status(config.BAD_REQUEST).json({ badge_category_data });
            } else {
                return res.status(config.OK_STATUS).json(badge_category_data);
            }
    } else {
        logger.error("Validation Error = ", errors);
        res.status(config.BAD_REQUEST).json({ message: errors });
    }
});

/**
 * @api {put} /admin/badge_category Update
 * @apiName Update
 * @apiGroup  Badge Category
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} name Name of badge category
 * @apiSuccess (Success 200) {Array} badge_category Array of badge_category document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:badge_category_id", async (req, res) => {
    badge_category_id = req.params.badge_category_id;
    console.log(badge_category_id);
    var schema = {
        "name": {
            notEmpty: true,
            errorMessage: "badge name is required"
        }
    };
    req.checkBody(schema);
    var errors = req.validationErrors();
    
    if (!errors) {
        var badge_category_obj = {
            "name": req.body.name,
            };

            let badge_category_data = await badge_category_helper.update_badge_category_by_id(badge_category_id,badge_category_obj);
            if (badge_category_data.status === 0) {
                logger.error("Error while updating badge_category data = ", badge_category_data);
                return res.status(config.BAD_REQUEST).json({ badge_category_data });
            } else {
                return res.status(config.OK_STATUS).json(badge_category_data);
            }
    } else {
        logger.error("Validation Error = ", errors);
        res.status(config.BAD_REQUEST).json({ message: errors });
    }

});

/**
 * @api {delete} /admin/badge_category/:badge_category_id Delete
 * @apiName Delete  
 * @apiGroup  Badge Category
 * 
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {String} Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:badge_category_id", async (req, res) => {

  logger.trace("Delete badge_category API - Id = ", req.query.id);
  let badge_category_data = await badge_category_helper.delete_badge_category_by_id(
    req.params.badge_category_id
  );

  if (badge_category_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(badge_category_data);
  } else {
    res.status(config.OK_STATUS).json(badge_category_data);
  }
});

module.exports = router;
