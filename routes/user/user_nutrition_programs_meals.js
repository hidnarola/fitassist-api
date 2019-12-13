var express = require("express");
var fs = require("fs");
var path = require("path");
var router = express.Router();
var config = require("../../config");
var logger = config.logger;
var meals_helper = require("../../helpers/meals_helper");
var user_nutrition_programs_meals_helper = require("../../helpers/user_nutrition_programs_meals_helper");
var new_nutrition_helper = require("../../helpers/new_nutrition_helper");
var common_helper = require("../../helpers/common_helper");
var jwtDecode = require("jwt-decode");
var mongoose = require("mongoose");

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
  if (req.body.description && req.body.meals_visibility === "public") {
    schema.description = {
      notEmpty: true,
      errorMessage: "Description is required"
    };
  }
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    let meals_obj = {
      title: req.body.title,
      description: req.body.description,
      serves: req.body.serves,
      serving_difficulty: req.body.serving_difficulty,
      categories: JSON.parse(req.body.categories), //JOSN
      cooking_time: JSON.parse(req.body.cooking_time), //JSON
      notes: req.body.notes,
      meals_type: req.body.meals_type,
      meals_visibility: req.body.meals_visibility,
      instructions: req.body.instructions,
      ingredientsIncluded:
        typeof req.body.ingredientsIncluded === "string"
          ? JSON.parse(req.body.ingredientsIncluded) //JSON
          : req.body.ingredientsIncluded,
      userId: authUserId,
      day: req.body.day,
      programId: req.body.programId
    };

    console.log("===========categories===========");
    console.log(req.body);
    console.log("==========================");

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

    // insert meal
    let meal_data = await user_nutrition_programs_meals_helper.insert_meal(
      meals_obj
    );
    if (meal_data.status === 0) {
      logger.error("Error while inserting meal data = ", meal_data);
      return res.status(config.BAD_REQUEST).json({
        meal_data
      });
    } else {
      // insert private meal copy of public meal
      meals_obj["meals_visibility"] = "private";

      if (req.body.meals_visibility && req.body.meals_visibility === "public") {
        // insert image for public meal

        filename =
          "meal_" +
          new Date().getTime() +
          Math.floor(Math.random() * 10000000) +
          extention;
        meals_obj.image = "uploads/meal/" + filename;
        file.mv(dir + "/" + filename, function(err) {
          if (err) {
            logger.error("There was an issue in uploading image");
            return res.send({
              status: config.MEDIA_ERROR_STATUS,
              err: "There was an issue in uploading image"
            });
          }
        });

        let public_meal_data = await user_nutrition_programs_meals_helper.insert_meal(
          meals_obj
        );
        if (public_meal_data.status === 0) {
          logger.error("Error while inserting meal data = ", meal_data);
          return res.status(config.BAD_REQUEST).json({
            public_meal_data
          });
        } else {
          return res.status(config.OK_STATUS).json(public_meal_data);
        }
      } else {
        return res.status(config.OK_STATUS).json(meal_data);
      }
    }
  } else {
    logger.error("Validation Error = ", errors);
    return res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

router.put("/meal/:meal_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  let meal_id = req.params.meal_id;
  let condition = {
    _id: meal_id,
    userId: authUserId
  };
  let meal_data = await user_nutrition_programs_meals_helper.update_meal(
    condition,
    req.body
  );
  if (meal_data.status === 1) {
    return res.status(config.OK_STATUS).json(meal_data);
  } else {
    logger.error("Error while updating meal data = ", meal_data);
    return res.status(config.BAD_REQUEST).json({
      meal_data
    });
  }
});

router.post("/meal/copy", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var schema = {
    meal_id: {
      notEmpty: true,
      errorMessage: "meal_id is required"
    },
    day: {
      notEmpty: true,
      errorMessage: "meal_id is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {
    let meal_id = mongoose.Types.ObjectId(req.body.meal_id);
    let mealDay = req.body.day;
    let condition = {
      _id: meal_id,
      userId: authUserId
    };
    let copy_meal = await user_nutrition_programs_meals_helper.find_meal(
      condition
    );
    if (copy_meal.status === 1) {
      var { _id, day, ...mealDetail } = copy_meal.meal[0]._doc;
      var copyMealData = mealDetail;
      copyMealData.day = parseInt(mealDay);
      var resp_data = await user_nutrition_programs_meals_helper.insert_meal(
        copyMealData
      );
      if (resp_data.status === 1) {
        return res.status(config.OK_STATUS).json(resp_data);
      } else {
        logger.error("Error while inserting meal data = ", resp_data);
        return res.status(config.BAD_REQUEST).json({
          resp_data
        });
      }
    } else {
      logger.error("Error while copying meal data = ", copy_meal);
      return res.status(config.BAD_REQUEST).json({
        copy_meal
      });
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

router.post("/meal/delete", async (req, res) => {
  var schema = {
    mealIds: {
      notEmpty: true,
      errorMessage: "mealIds is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {
    try {
      var mealIds = req.body.mealIds;
      mealIds.forEach((id, index) => {
        mealIds[index] = mongoose.Types.ObjectId(id);
      });
      logger.trace("Delete workout by - Id = ", mealIds);
      let meal_data = await user_nutrition_programs_meals_helper.delete_user_meals_by_ids(
        mealIds
      );
      if (meal_data.status === 1) {
        return res.status(config.OK_STATUS).json(meal_data);
      } else {
        return res.status(config.BAD_REQUEST).json({
          meal_data
        });
      }
    } catch (err) {
      return res.status(config.BAD_REQUEST).json({
        status: 0,
        message: err.message
      });
    }
  } else {
    return res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

module.exports = router;
