var express = require("express");
var fs = require("fs");
var path = require("path");
var router = express.Router();
var config = require("../../config");
var logger = config.logger;
var meals_helper = require("../../helpers/meals_helper");
var new_nutrition_helper = require("../../helpers/new_nutrition_helper");
var common_helper = require("../../helpers/common_helper");
var jwtDecode = require("jwt-decode");

//  post meal
router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var schema = {
    title: {
      notEmpty: true,
      isLength: {
        errorMessage: "title should be between 2 to 50 characters",
        options: {
          min: 2,
          max: 50
        }
      },
      errorMessage: "title of meal is required"
    },
    meals_type: {
      notEmpty: true,
      errorMessage: "meals type is required"
    },
    meals_visibility: {
      notEmpty: true,
      errorMessage: "meals_visibility is required"
    },
    ingredientsIncluded: {
      notEmpty: true,
      errorMessage: "ingredients is required"
    }
  };

  if (req.body.meals_visibility && req.body.meals_visibility === "public") {
    schema.instructions = {
      notEmpty: true,
      errorMessage: "Instruction is required"
    };
  }
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    let meals_obj = {
      title: req.body.title,
      notes: req.body.notes,
      meals_type: req.body.meals_type,
      meals_visibility: req.body.meals_visibility,
      instructions: req.body.instructions,
      ingredientsIncluded:
        typeof req.body.ingredientsIncluded === "string"
          ? JSON.parse(req.body.ingredientsIncluded)
          : req.body.ingredientsIncluded,
      userId: authUserId
    };

    //image upload
    let filename;
    let file;
    if (req.files && req.files["meal_img"]) {
      file = req.files["meal_img"];
      extention = path.extname(file.name);
      filename = "meal_" + new Date().getTime() + extention;
      meals_obj.image = "uploads/meal/" + filename;
    }

    if (req.files && req.files["meal_img"]) {
      var dir = "./uploads/meal";
      var mimetype = ["image/png", "image/jpeg", "image/jpg"];

      if (mimetype.indexOf(file.mimetype) != -1) {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
        file.mv(dir + "/" + filename, function(err) {
          if (err) {
            logger.error("There was an issue in uploading image");
            return res.send({
              status: config.MEDIA_ERROR_STATUS,
              err: "There was an issue in uploading image"
            });
          } else {
            logger.trace("image has been uploaded. Image name = ", filename);
          }
        });
      } else {
        logger.error("Image format is invalid");
        return res.send({
          status: config.MEDIA_ERROR_STATUS,
          err: "Image format is invalid",
          message: "Image format is invalid"
        });
      }
    } else {
      logger.info("Image not available to upload. Executing next instruction");
    }

    // insert recent ingredient
    let recent_ingredient = await new_nutrition_helper.insert_recent_ingredient(
      meals_obj
    );

    let meal_data = await meals_helper.insert_meal(meals_obj);
    if (meal_data.status === 0) {
      logger.error("Error while inserting meal data = ", meal_data);
      return res.status(config.BAD_REQUEST).json({
        meal_data
      });
    } else {
      return res.status(config.OK_STATUS).json(meal_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    return res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

router.post("/search", async (req, res) => {
  var re = new RegExp(
    req.body.name.replace(/[^a-zA-Z ]/g, "").replace(/ +/g, " "),
    "i"
  );
  var re1 = new RegExp(
    req.body.name
      .replace(/[^a-zA-Z ]/g, "")
      .replace(/ +/g, " ")
      .split(" ")
      .reverse()
      .join(" "),
    "i"
  );

  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  value = {
    $regex: re
  };
  var projectObj = {
    $project: {
      title: 1,
      meals_type: 1,
      meals_visibility: 1,
      ingredientsIncluded: 1,
      userId: 1,
      image: 1
    }
  };
  var searchObject = {
    $match: {
      $and: [
        { $or: [{ title2: { $regex: re } }, { title2: { $regex: re1 } }] },
        { userId: authUserId }
      ]
    }
  };
  var start = {
    $skip: parseInt(req.body.start ? req.body.start : 0)
  };
  var offset = {
    $limit: parseInt(req.body.offset ? req.body.offset : 10)
  };
  let resp_data = await meals_helper.search_meal(
    projectObj,
    searchObject,
    start,
    offset
  );
  if (resp_data.status == 1) {
    res.status(config.OK_STATUS).json(resp_data);
  } else {
    res.status(config.BAD_REQUEST).json(resp_data);
  }
});

// get meal detail from id
router.get("/:meal_id", async (req, res) => {
  var resp_data = await meals_helper.get_meal_id(req.params.meal_id);
  if (resp_data.status == 0) {
    console.log("Error occured while fetching meal = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    console.log("meal got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

module.exports = router;
