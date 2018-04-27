var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");
var jwtDecode = require("jwt-decode");

var router = express.Router();

var config = require("../../config");
var logger = config.logger;

var shopping_cart_helper = require("../../helpers/shopping_cart_helper");

/**
 * @api {get} /user/shoppingcart Get all
 * @apiName Get all
 * @apiGroup  Shopping Cart
 * @apiHeader {String}  x-access-token User's unique access-key
 * @apiSuccess (Success 200) {Array} shopping_carts Array of shoppingcart document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  logger.trace("Get all shoppingcart API called");
  var resp_data = await shopping_cart_helper.get_all_shoppingcart({
    userId: authUserId
  });
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching shopping cart = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("shopping cart got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {get} /user/shoppingcart/shopping_cart_id Get by ID
 * @apiName Get by ID
 * @apiGroup  Shopping Cart
 * @apiHeader {String}  x-access-token User's unique access-key
 * @apiSuccess (Success 200) {Array} shopping_cart Array of shoppingcart document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:shopping_cart_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  shopping_cart_id = req.params.shopping_cart_id;
  logger.trace("Get all shopping cart API called");
  var resp_data = await shopping_cart_helper.get_shopping_cart_id({
    _id: shopping_cart_id,
    userId: authUserId
  });
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching shopping cart = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("shopping cart got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /user/shoppingcart  Add
 * @apiName Add
 * @apiGroup  Shopping Cart
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token User's unique access-key
 * @apiParam {String} itemId ingredients  ID
 * @apiParam {Number} qty Quantity of ingredients
 * @apiSuccess (Success 200) {JSON} shopping_cart added shopping cart detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var schema = {
    itemId: {
      notEmpty: true,
      errorMessage: "Item ID is required"
    },
    qty: {
      notEmpty: true,
      errorMessage: "Quantity is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var shopping_cart_obj = {
      itemId: req.body.itemId,
      qty: req.body.qty,
      userId: authUserId
    };

    let shopping_cart_data = await shopping_cart_helper.insert_shopping_cart(
      shopping_cart_obj
    );
    if (shopping_cart_data.status === 0) {
      logger.error(
        "Error while inserting shopping cart data = ",
        shopping_cart_data
      );
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
 * @api {put} /user/shoppingcart  Update
 * @apiName Update
 * @apiGroup  Shopping Cart
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token User's unique access-key
 * @apiParam {String} itemId ingredients  ID
 * @apiParam {Number} qty Quantity of ingredients
 * @apiSuccess (Success 200) {JSON} shopping_cart updated shopping cart detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:shopping_cart_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  shopping_cart_id = req.params.shopping_cart_id;
  var schema = {
    itemId: {
      notEmpty: true,
      errorMessage: "Item ID is required"
    },
    qty: {
      notEmpty: true,
      errorMessage: "Quantity is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var shopping_cart_obj = {
      itemId: req.body.itemId,
      qty: req.body.qty,
      userId: authUserId
    };

    let shopping_cart_data = await shopping_cart_helper.update_shopping_cart_by_id(
      { _id: shopping_cart_id, userId: authUserId },
      shopping_cart_obj
    );
    if (shopping_cart_data.status === 0) {
      logger.error(
        "Error while updating shopping cart data = ",
        shopping_cart_data
      );
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
 * @api {delete} /user/shoppingcart/:shopping_cart_id Delete
 * @apiName Delete
 * @apiGroup  Shopping Cart
 *
 * @apiHeader {String}  x-access-token User's unique access-key
 *
 * @apiSuccess (Success 200) {String} Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:shopping_cart_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  logger.trace("Delete shopping cart API - Id = ", req.params.shopping_cart_id);
  let shopping_cart_data = await shopping_cart_helper.delete_shopping_cart_by_id(
    {_id:req.params.shopping_cart_id,userId:authUserId}
  );

  if (shopping_cart_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(shopping_cart_data);
  } else {
    res.status(config.OK_STATUS).json(shopping_cart_data);
  }
});

module.exports = router;
