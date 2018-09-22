var express = require("express");
var fs = require("fs");
var path = require("path");

var router = express.Router();

var config = require("../../config");
var logger = config.logger;

var ingredients_helper = require("../../helpers/ingredient_helper");
var common_helper = require("../../helpers/common_helper");

/**
 * @api {post} /admin/ingredient/filter Filter
 * @apiName Filter
 * @apiDescription Request Object :<pre><code>
 * {
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
      value: "ake@narola.email"
    }
  ]
}</code></pre>
 * @apiGroup Ingredient
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {Object} columnFilter columnFilter Object for filter data
 * @apiParam {Object} columnSort columnSort Object for Sorting Data
 * @apiParam {Object} columnFilterEqual columnFilterEqual Object for select box
 * @apiParam {Number} pageSize pageSize
 * @apiParam {Number} page page number
 * @apiSuccess (Success 200) {Array} filtered_ingredients filtered details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/filter", async (req, res) => {
  filter_object = common_helper.changeObject(req.body);
  let filtered_data = await ingredients_helper.get_filtered_records(
    filter_object
  );
  if (filtered_data.status === 0) {
    logger.error("Error while fetching searched data = ", filtered_data);
    return res.status(config.BAD_REQUEST).json({
      filtered_data
    });
  } else {
    return res.status(config.OK_STATUS).json(filtered_data);
  }
});

/**
 * @api {get} /admin/ingredient Get all
 * @apiName Get all
 * @apiGroup Ingredient
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} ingredients Array of Ingredients document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  logger.trace("Get all Ingredients API called");
  var resp_data = await ingredients_helper.get_all_ingredients();
  if (resp_data.status == 0) {
    logger.error("Error occured while Ingredients  = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("Ingredients got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {get} /admin/ingredient/ingredient_id Get by ID
 * @apiName  - Get Ingredient by ID
 * @apiGroup Ingredient
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} ingredient_id ID of Ingredient
 * @apiSuccess (Success 200) {JSON} ingredient Object of Ingredient document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:ingredient_id", async (req, res) => {
  ingredient_id = req.params.ingredient_id;
  logger.trace("Get all ingredient API called");
  var resp_data = await ingredients_helper.get_ingredient_id(ingredient_id);
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching ingredient = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("ingredient got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /admin/ingredient Add
 * @apiName Add
 * @apiGroup Ingredient
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} name name of Ingredient
 * @apiParam {String} [description] description of Ingredient
 * @apiParam {Boolean} allowInShopList allowInShopList of Ingredient
 * @apiParam {File} [ingredient_img] image of Ingredient
 * @apiSuccess (Success 200) {JSON} ingredient ingredient details
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
      errorMessage: "Name of ingredient is required"
    }
  };

  req.checkBody(schema);

  var errors = req.validationErrors();
  if (!errors) {
    var ingredient_obj = {
      name: req.body.name,
      description: req.body.description ? req.body.description : null,
      allowInShopList: req.body.allowInShopList
    };

    //image upload
    var filename;
    if (req.files && req.files["ingredient_img"]) {
      var file = req.files["ingredient_img"];
      var dir = "./uploads/ingredient";
      var mimetype = ["image/png", "image/jpeg", "image/jpg"];

      if (mimetype.indexOf(file.mimetype) != -1) {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
        extention = path.extname(file.name);
        filename = "ingredient_" + new Date().getTime() + extention;
        file.mv(dir + "/" + filename, function (err) {
          if (err) {
            logger.error("There was an issue in uploading image");
            res.send({
              status: config.MEDIA_ERROR_STATUS,
              err: "There was an issue in uploading image"
            });
          } else {
            logger.trace("image has been uploaded. Image name = ", filename);
            //return res.send(200, "null");
          }
        });
      } else {
        logger.error("Image format is invalid");
        res.send({
          status: config.VALIDATION_FAILURE_STATUS,
          err: "Image format is invalid"
        });
      }
    } else {
      logger.info("Image not available to upload. Executing next instruction");
      //res.send(config.MEDIA_ERROR_STATUS, "No image submitted");
    }
    if (filename) {
      ingredient_obj.image = "uploads/ingredient/" + filename;
    }

    //End image upload

    let ingredient_data = await ingredients_helper.insert_ingredient(
      ingredient_obj
    );
    if (ingredient_data.status === 0) {
      logger.error("Error while inserting ingredient = ", ingredient_data);
      res.status(config.BAD_REQUEST).json({
        ingredient_data
      });
    } else {
      res.status(config.OK_STATUS).json(ingredient_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

/**
 * @api {put} /admin/ingredient/:ingredient_id Update
 * @apiName Update
 * @apiGroup Ingredient
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} name name of Ingredient
 * @apiParam {String} [description] description of Ingredient
 * @apiParam {Boolean} allowInShopList allowInShopList of Ingredient
 * @apiParam {File} [ingredient_img] image of Ingredient
 * @apiSuccess (Success 200) {JSON} ingredient ingredient details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:ingredient_id", async (req, res) => {
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
      errorMessage: "Name of ingredient is required"
    }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {
    var ingredient_obj = {
      name: req.body.name,
      description: req.body.description ? req.body.description : null,
      allowInShopList: req.body.allowInShopList,
      modifiedAt: new Date()
    };

    //image upload
    var filename;
    if (req.files && req.files["ingredient_img"]) {
      var file = req.files["ingredient_img"];
      var dir = "./uploads/ingredient";
      var mimetype = ["image/png", "image/jpeg", "image/jpg"];

      if (mimetype.indexOf(file.mimetype) != -1) {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
        extention = path.extname(file.name);
        filename = "ingredient_" + new Date().getTime() + extention;
        file.mv(dir + "/" + filename, function (err) {
          if (err) {
            logger.error("There was an issue in uploading image");
            res.send({
              status: config.MEDIA_ERROR_STATUS,
              err: "There was an issue in uploading image"
            });
          } else {
            logger.trace("image has been uploaded. Image name = ", filename);
            //return res.send(200, "null");
          }
        });
      } else {
        logger.error("Image format is invalid");
        res.send({
          status: config.VALIDATION_FAILURE_STATUS,
          err: "Image format is invalid"
        });
      }
    } else {
      logger.info("Image not available to upload. Executing next instruction");
      //res.send(config.MEDIA_ERROR_STATUS, "No image submitted");
    }
    if (filename) {
      ingredient_obj.image = "uploads/ingredient/" + filename;
      var resp_data = await ingredients_helper.get_ingredient_id(
        req.params.ingredient_id
      );
      try {
        fs.unlink(resp_data.ingredient.image, function () {});
      } catch (err) {}
    }

    //End image upload

    let ingredient_data = await ingredients_helper.update_ingredient(
      req.params.ingredient_id,
      ingredient_obj
    );
    if (ingredient_data.status === 0) {
      logger.error("Error while updating ingredient = ", ingredient_data);
      res.status(config.BAD_REQUEST).json({
        ingredient_data
      });
    } else {
      res.status(config.OK_STATUS).json(ingredient_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

/**
 * @api {delete} /admin/ingredient/:ingredient_id Delete
 * @apiName Delete
 * @apiGroup Ingredient
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:ingredient_id", async (req, res) => {
  logger.trace("Delete Ingredient API - Id = ", req.params.ingredient_id);
  var resp_data = await ingredients_helper.get_ingredient_id(
    req.params.ingredient_id
  );
  let ingredient_data = await ingredients_helper.delete_ingredient_by_id(
    req.params.ingredient_id
  );

  if (ingredient_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(ingredient_data);
  } else {
    res.status(config.OK_STATUS).json(ingredient_data);
  }
});

module.exports = router;