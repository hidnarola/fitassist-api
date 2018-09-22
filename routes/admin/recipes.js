var express = require("express");
var fs = require("fs");
var path = require("path");
var router = express.Router();
var config = require("../../config");
var logger = config.logger;
var recipes_helper = require("../../helpers/recipes_helper");
var common_helper = require("../../helpers/common_helper");

/**
 * @api {post} /admin/recipes/filter Filter
 * @apiName Filter
 * @apiGroup Recipes
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
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * 
 * @apiParam {Object} columnFilter columnFilter Object for filter data
 * @apiParam {Object} columnSort columnSort Object for Sorting Data
 * @apiParam {Object} columnFilterEqual columnFilterEqual Object for select box
 * @apiParam {Number} pageSize pageSize
 * @apiParam {Number} page page number
 * @apiSuccess (Success 200) {Array} filtered_recipes filtered details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/filter", async (req, res) => {
  filter_object = common_helper.changeObject(req.body);
  let filtered_data = await recipes_helper.get_filtered_records(filter_object);
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
 * @api {get} /admin/recipes Get all
 * @apiName Get all
 * @apiGroup Recipes
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} recipes Array of recipes document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  logger.trace("Get All Recipes API called");
  var resp_data = await recipes_helper.get_all_recipes();
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching Recipes = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("Recipes got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {get} /admin/recipes/recipe_id Get by ID
 * @apiName Get by ID
 * @apiGroup Recipes
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {JSON} recipe Array of Recipes document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:recipe_id", async (req, res) => {
  recipe_id = req.params.recipe_id;
  logger.trace("Get recipe by id API called");
  var resp_data = await recipes_helper.get_recipe_by_id(recipe_id);
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching recipe = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("recipe got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});
/**
 * @api {post} /admin/recipes Add
 * @apiName Add
 * @apiGroup Recipes
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} name name of recipe
 * @apiParam {String} [description] description of recipe
 * @apiParam {String} [method] method of recipe
 * @apiParam {Array} [ingredients] ingredients of recipe
 * @apiParam {Array} [ingredientsIncluded] ingredientsIncluded
 * @apiParam {Number} [preparationTime] time of preparationTime
 * @apiParam {Number} [cookTime] cooking time
 * @apiParam {Enum} [difficultyLevel] difficultyLevel of recipe
 * @apiParam {Number} [rating] rating of recipe
 * @apiParam {Array} recipeType recipe Type | Possible Values ('pescaterian','paleo','vegetarian','vegan','dairy-free','kosher','islam','coeliac')
 * @apiParam {Array} nutritions nutritions Object Array
 * @apiParam {File} [recipe_img] recipe image
 * @apiSuccess (Success 200) {JSON} recipe Array of recipes document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  var schema = {
    name: {
      notEmpty: true,
      isLength: {
        errorMessage: 'Name should be between 2 to 50 characters',
        options: {
          min: 2,
          max: 50
        }
      },
      errorMessage: "name of recipe is required"
    },
    recipeType: {
      notEmpty: true,
      errorMessage: "RecipeType is required"
    },
    nutritions: {
      notEmpty: true,
      errorMessage: "Nutritions is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var recipe_obj = {
      name: req.body.name,
      description: req.body.description,
      method: req.body.method,
      ingredients: req.body.ingredients,
      ingredientsIncluded: JSON.parse(req.body.ingredientsIncluded),
      preparationTime: req.body.preparationTime,
      cookTime: req.body.cookTime,
      difficultyLevel: req.body.difficultyLevel,
      rating: req.body.rating,
      recipeType: JSON.parse(req.body.recipeType),
      nutritions: JSON.parse(req.body.nutritions),
      modifiedAt: new Date()
    };
    //image upload
    var filename;
    if (req.files && req.files["recipe_img"]) {
      var file = req.files["recipe_img"];
      var dir = "./uploads/recipe";
      var mimetype = ["image/png", "image/jpeg", "image/jpg"];

      if (mimetype.indexOf(file.mimetype) != -1) {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
        extention = path.extname(file.name);
        filename = "recipe_" + new Date().getTime() + extention;
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
    recipe_obj.image = "uploads/recipe/" + filename;

    let recipe_data = await recipes_helper.insert_recipes(recipe_obj);
    if (recipe_data.status === 0) {
      logger.error("Error while inserting recipe data = ", recipe_data);
      return res.status(config.BAD_REQUEST).json({
        recipe_data
      });
    } else {
      return res.status(config.OK_STATUS).json(recipe_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});
/**
 * @api {put} /admin/recipes Add
 * @apiName Add
 * @apiGroup Recipes
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} name name of recipe
 * @apiParam {String} [description] description of recipe
 * @apiParam {String} [method] method of recipe
 * @apiParam {Array} [ingredients] ingredients of recipe
 * @apiParam {Array} [ingredientsIncluded] ingredientsIncluded
 * @apiParam {Number} [preparationTime] time of preparationTime
 * @apiParam {Number} [cookTime] cooking time
 * @apiParam {Enum} [difficultyLevel] difficultyLevel of recipe
 * @apiParam {Number} [rating] rating of recipe
 * @apiParam {Array} recipeType recipe Type | Possible Values ('pescaterian','paleo','vegetarian','vegan','dairy-free','kosher','islam','coeliac')
 * @apiParam {Array} nutritions nutritions Object Array
 * @apiParam {File} [recipe_img] recipe image
 * @apiSuccess (Success 200) {JSON} recipe JSON of recipes document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:recipe_id", async (req, res) => {
  var schema = {
    name: {
      notEmpty: true,
      isLength: {
        errorMessage: 'First Name should be between 2 to 50 characters',
        options: {
          min: 2,
          max: 50
        }
      },
      errorMessage: "name of recipe is required"
    },
    recipeType: {
      notEmpty: true,
      errorMessage: "RecipeType is required"
    },
    nutritions: {
      notEmpty: true,
      errorMessage: "Nutritions is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var recipe_obj = {
      name: req.body.name,
      description: req.body.description,
      method: req.body.method,
      ingredients: req.body.ingredients,
      ingredientsIncluded: JSON.parse(req.body.ingredientsIncluded),
      preparationTime: req.body.preparationTime,
      cookTime: req.body.cookTime,
      difficultyLevel: req.body.difficultyLevel,
      rating: req.body.rating,
      recipeType: JSON.parse(req.body.recipeType),
      nutritions: JSON.parse(req.body.nutritions)
    };
    //image upload
    var filename;
    if (req.files && req.files["recipe_img"]) {
      var file = req.files["recipe_img"];
      var dir = "./uploads/recipe";
      var mimetype = ["image/png", "image/jpeg", "image/jpg"];

      if (mimetype.indexOf(file.mimetype) != -1) {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
        extention = path.extname(file.name);
        filename = "recipe_" + new Date().getTime() + extention;
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
      recipe_obj.image = "uploads/recipe/" + filename;
      var single_data = await recipes_helper.get_recipe_by_id(
        req.params.recipe_id
      );
      try {
        fs.unlink(single_data.recipe.image, function () {});
      } catch (err) {}
    }

    let recipe_data = await recipes_helper.update_recipes_by_id(
      req.params.recipe_id,
      recipe_obj
    );
    if (recipe_data.status === 0) {
      logger.error("Error while updating recipe data = ", recipe_data);
      return res.status(config.BAD_REQUEST).json({
        recipe_data
      });
    } else {
      return res.status(config.OK_STATUS).json(recipe_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});
/**
 * @api {delete} /admin/recipe/:recipe_id Delete
 * @apiName Delete
 * @apiGroup Recipes
 *
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:recipe_id", async (req, res) => {
  logger.trace("Delete recipe API - Id = ", req.params.recipe_id);

  let recipe = await recipes_helper.delete_recipes_by_id(req.params.recipe_id);

  if (recipe.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(recipe);
  } else {
    res.status(config.OK_STATUS).json(recipe);
  }
});

module.exports = router;