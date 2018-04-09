var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");

var router = express.Router();

var config = require("../../config");
var logger = config.logger;

var shopping_cart_helper = require("../../helpers/shopping_cart_helper");

/**
 * @api {get} /admin/shppingcart Get all
 * @apiName Get all
 * @apiGroup  Shopping Cart
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} shoppingcart Array of shoppingcart document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {

    logger.trace("Get all shoppingcart API called");
    var resp_data = await shopping_cart_helper.get_all_shoppingcart();
    if (resp_data.status == 0) {
      logger.error("Error occured while fetching shoppingcart = ", resp_data);
      res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    } else {
      logger.trace("shoppingcart got successfully = ", resp_data);
      res.status(config.OK_STATUS).json(resp_data);
    }
  });

/**
 * @api {get} /admin/shppingcart/shopping_cart_id Get by ID
 * @apiName Get by ID
 * @apiGroup  Shopping Cart
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} shoppingcart Array of shoppingcart document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:shopping_cart_id", async (req, res) => {
    shopping_cart_id = req.params.shopping_cart_id;
  logger.trace("Get all shoppingcart API called");
  var resp_data = await shopping_cart_helper.get_shopping_cart_id(shopping_cart_id);
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching shoppingcart = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("shoppingcart got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /admin/shppingcart  Add
 * @apiName Add
 * @apiGroup  Shopping Cart
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} itemId ingredients  ID
 * @apiParam {Number} qty Quantity of ingredients
 * @apiParam {String} userId User ID
 * @apiSuccess (Success 200) {JSON} shppingcart added shppingcart detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/", async (req, res) => {
    var schema = {
        "itemId": {
            notEmpty: true,
            errorMessage: "Item ID is required"
        },
        "qty": {
            notEmpty: true,
            errorMessage: "Quantity is required"
        },
        "userId": {
            notEmpty: true,
            errorMessage: "User ID is required"
        }
    };
    req.checkBody(schema);
    var errors = req.validationErrors();
    
    if (!errors) {
        var shopping_cart_obj = {
            "itemId": req.body.itemId,
            "qty": req.body.qty,
            "userId": req.body.userId,
            };

            let shopping_cart_data = await shopping_cart_helper.insert_shopping_cart(shopping_cart_obj);
            if (shopping_cart_data.status === 0) {
                logger.error("Error while inserting shopping cart data = ", shopping_cart_data);
                return res.status(config.BAD_REQUEST).json({ shopping_cart_data });
            } else {
                return res.status(config.OK_STATUS).json(shopping_cart_data);
            }
    } else {
        logger.error("Validation Error = ", errors);
        res.status(config.BAD_REQUEST).json({ message: errors });
    }
});

/**
 * @api {put} /admin/shppingcart  Update
 * @apiName Update
 * @apiGroup  Shopping Cart
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} itemId ingredients  ID
 * @apiParam {Number} qty Quantity of ingredients
 * @apiParam {String} userId User ID
 * @apiSuccess (Success 200) {JSON} shppingcart updated shppingcart detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:shopping_cart_id", async (req, res) => {
    shopping_cart_id = req.params.shopping_cart_id;
    var schema = {
        "itemId": {
            notEmpty: true,
            errorMessage: "Item ID is required"
        },
        "qty": {
            notEmpty: true,
            errorMessage: "Quantity is required"
        },
        "userId": {
            notEmpty: true,
            errorMessage: "User ID is required"
        }
    };
    req.checkBody(schema);
    var errors = req.validationErrors();
    
    if (!errors) {
        var shopping_cart_obj = {
            "itemId": req.body.itemId,
            "qty": req.body.qty,
            "userId": req.body.userId,
            };

            let shopping_cart_data = await shopping_cart_helper.update_shopping_cart(shopping_cart_id,shopping_cart_obj);
            if (shopping_cart_data.status === 0) {
                logger.error("Error while updating shopping cart data = ", shopping_cart_data);
                return res.status(config.BAD_REQUEST).json({ shopping_cart_data });
            } else {
                return res.status(config.OK_STATUS).json(shopping_cart_data);
            }
    } else {
        logger.error("Validation Error = ", errors);
        res.status(config.BAD_REQUEST).json({ message: errors });
    }
});

/**
 * @api {delete} /admin/shppingcart/:shopping_cart_id Delete
 * @apiName Delete  
 * @apiGroup  Shopping Cart
 * 
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * 
 * @apiSuccess (Success 200) {String} Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:shopping_cart_id", async (req, res) => {

  logger.trace("Delete shoppingcart API - Id = ", req.query.id);
  let shopping_cart_data = await shopping_cart_helper.delete_shopping_cart(
    req.params.shopping_cart_id
  );

  if (shopping_cart_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(shopping_cart_data);
  } else {
    res.status(config.OK_STATUS).json(shopping_cart_data);
  }
});

module.exports = router;
