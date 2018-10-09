var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");
var mongoose = require("mongoose");
var router = express.Router();
var config = require("../../config");
var constants = require("../../constant");
var logger = config.logger;
var exercise_helper = require("../../helpers/exercise_helper");
var common_helper = require("../../helpers/common_helper");

/**
 * @api {post} /admin/exercise/filter Filter
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
 * @apiGroup Exercise
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {Object} columnFilter columnFilter Object for filter data
 * @apiParam {Object} columnSort columnSort Object for Sorting Data
 * @apiParam {Object} columnFilterEqual columnFilterEqual Object for select box
 * @apiParam {Number} pageSize pageSize
 * @apiParam {Number} page page number
 * @apiSuccess (Success 200) {JSON} filtered_exercises filtered details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/filter", async (req, res) => {
  filter_object = common_helper.changeObject(req.body);
  let filtered_data = await exercise_helper.get_filtered_records(filter_object);
  if (filtered_data.status == 0) {
    logger.error("Error while fetching searched data = ", filtered_data);
    return res.status(config.INTERNAL_SERVER_ERROR).json({
      filtered_data
    });
  } else {
    return res.status(config.OK_STATUS).json(filtered_data);
  }
});

/**
 * @api {get} /admin/exercise Get all
 * @apiName Get all
 * @apiGroup Exercise
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} exercises Array of Exercises document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  logger.trace("Get all exercise API called");
  var resp_data = await exercise_helper.get_all_exercise();
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching exercise = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("Exercises got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {get} /admin/exercise/exercise_id Get by ID
 * @apiName Get Exercise by ID
 * @apiGroup Exercise
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} exercise_id ID of Exercise
 * @apiSuccess (Success 200) {JSON} exercise Array of Exercise document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:exercise_id", async (req, res) => {
  logger.trace("Get all exercise API called : " + req.params.exercise_id);
  var resp_data = await exercise_helper.get_exercise_id({
    _id: mongoose.Types.ObjectId(req.params.exercise_id)
  });
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching exercise = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("Exercises got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /admin/exercise Add
 * @apiName Add
 * @apiGroup Exercise
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} name Name of Exercise
 * @apiParam {String} [description] Description of Exercise
 * @apiParam {String} mainMuscleGroup Reference id of from muscles group collection
 * @apiParam {Array} [otherMuscleGroup] Reference ids of from muscles group collection
 * @apiParam {Array} [detailedMuscleGroup] Reference ids of from muscles group collection
 * @apiParam {Array} category Category of exercise
 * @apiParam {Array} subCategory Sub Category of exercise <code>not required if category balance is seleted</code>
 * @apiParam {Enum} [mechanics] Mechanics of Exercise | Possible Values('Compound', 'Isolation')
 * @apiParam {Array} equipments Reference ids from equipments collection
 * @apiParam {Enum} difficltyLevel Difficlty level of exercise | Possible Values('Beginner', 'Intermediate', 'Expert')
 * @apiParam {Array} [steps] Steps of Exercise
 * @apiParam {Array} [tips] tips of Exercise
 * @apiParam {Files} [images] Images of Exercise
 * @apiSuccess (Success 200) {JSON} exercise Exercise details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  var schema = {
    name: {
      notEmpty: true,
      isLength: {
        errorMessage: "Name should be between 3 to 150 characters",
        options: {
          min: 3,
          max: 150
        }
      },
      errorMessage: "Name is required"
    },
    mainMuscleGroup: {
      notEmpty: true,
      errorMessage: "Main Muscle is required"
    },
    category: {
      notEmpty: true,
      isIn: {
        options: [constants.EXERCISES_CATEGORIES],
        errorMessage: "Please select valid Category"
      },
      errorMessage: "Category  is required"
    },
    equipments: {
      notEmpty: true,
      errorMessage: "Equipments is required"
    },
    status: {
      notEmpty: true,
      errorMessage: "Status is required"
    },
    difficltyLevel: {
      notEmpty: true,
      errorMessage: "Difficlty Level is required"
    }
  };

  if (req.body.category && req.body.category !== "balance") {
    schema.subCategory = {
      notEmpty: true,
      isIn: {
        options: [constants.EXERCISES_SUBCATEGORIES],
        errorMessage: "Please enter valid Sub category "
      },
      errorMessage: "Sub Category is required"
    };
  }

  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {
    let count = await exercise_helper.count_exercises({ name: req.body.name });
    if (count.status === 1 && count.count > 0) {
      logger.error("Name Validation Error = ");
      return res.status(config.VALIDATION_FAILURE_STATUS).json({
        message: [{
          msg: "Name already exists"
        }]
      });
    }

    mainMuscleGroupData = mongoose.Types.ObjectId(req.body.mainMuscleGroup);
    detailedMuscleGroupData = [];
    equipmentsData = [];
    otherMuscleGroupData = [];

    if (req.body.otherMuscleGroup) {
      JSON.parse(req.body.otherMuscleGroup).forEach(element => {
        otherMuscleGroupData.push(mongoose.Types.ObjectId(element));
      });
    }
    if (req.body.detailedMuscleGroup) {
      JSON.parse(req.body.detailedMuscleGroup).forEach(element => {
        detailedMuscleGroupData.push(mongoose.Types.ObjectId(element));
      });
    }
    if (req.body.equipments) {
      JSON.parse(req.body.equipments).forEach(element => {
        equipmentsData.push(mongoose.Types.ObjectId(element));
      });
    }
    var exercise_obj = {
      name: req.body.name,
      description: req.body.description ? req.body.description : null,
      mainMuscleGroup: mainMuscleGroupData,
      otherMuscleGroup: otherMuscleGroupData,
      detailedMuscleGroup: detailedMuscleGroupData,
      category: req.body.category,
      mechanics: req.body.mechanics ? req.body.mechanics : "compound",
      equipments: equipmentsData,
      difficltyLevel: req.body.difficltyLevel,
      status: req.body.status,
      steps: req.body.steps ? JSON.parse(req.body.steps) : [],
      tips: req.body.tips ? JSON.parse(req.body.tips) : []
    };
    if (req.body.subCategory) {
      exercise_obj.subCategory = req.body.subCategory;
    }

    async.waterfall(
      [
        function (callback) {
          //image upload
          if (req.files && req.files["images"]) {
            var file_path_array = [];
            // var files = req.files['images'];
            var files = [].concat(req.files.images);
            var dir = "./uploads/exercise";

            // assuming openFiles is an array of file names
            async.eachSeries(
              files,
              function (file, loop_callback) {
                var mimetype = ["image/png", "image/jpeg", "image/jpg"];
                if (mimetype.indexOf(file.mimetype) != -1) {
                  if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                  }
                  extention = path.extname(file.name);
                  filename = "exercise_" + new Date().getTime() + extention;
                  file.mv(dir + "/" + filename, function (err) {
                    if (err) {
                      logger.error("There was an issue in uploading image");
                      loop_callback(
                        {
                          message: [{
                            "msg": "There was an issue in uploading image"
                          },],
                          status: config.INTERNAL_SERVER_ERROR,
                        }
                      );
                    } else {
                      logger.trace(
                        "image has been uploaded. Image name = ",
                        filename
                      );
                      location = "uploads/exercise/" + filename;
                      file_path_array.push(location);
                      loop_callback();
                    }
                  });
                } else {
                  logger.error("Image format is invalid");
                  loop_callback({
                    message: [{
                      "msg": "Invalid file(s). Please select jpg, png, gif only."
                    },],
                    status: config.VALIDATION_FAILURE_STATUS,
                  });
                }
              },
              function (err) {
                // if any of the file processing produced an error, err would equal that error
                if (err) {
                  res.status(err.status).json(err);
                } else {
                  callback(null, file_path_array);
                }
              }
            );
          } else {
            logger.info(
              "Image not available to upload. Executing next instruction"
            );
            callback(null, []);
          }
        }
      ],
      async (err, file_path_array) => {
        //End image upload
        exercise_obj.images = file_path_array;

        let exercise_data = await exercise_helper.insert_exercise(exercise_obj);

        if (exercise_data.status == 0) {
          logger.error("Error while inserting exercise data = ", exercise_data);
          res.status(config.INTERNAL_SERVER_ERROR).json({
            exercise_data
          });
        } else {
          logger.error("Successfully inserted exercise data = ", exercise_data);
          res.status(config.OK_STATUS).json(exercise_data);
        }
      }
    );
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

/**
 * @api {put} /admin/exercise Update
 * @apiName Update
 * @apiGroup Exercise
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} name Name of Exercise
 * @apiParam {String} [description] Description of Exercise
 * @apiParam {String} mainMuscleGroup Reference id of from muscles group collection
 * @apiParam {Array} [otherMuscleGroup] Reference ids of from muscles group collection
 * @apiParam {Array} [detailedMuscleGroup] Reference ids of from muscles group collection
 * @apiParam {Array} category Category of exercise
 * @apiParam {Array} subCategory Sub Category of exercise <code>not required if category balance is seleted</code>
 * @apiParam {Enum} [mechanics] Mechanics of Exercise | Possible Values('Compound', 'Isolation')
 * @apiParam {Array} equipments Reference ids from equipments collection
 * @apiParam {Enum} difficltyLevel Difficlty level of exercise | Possible Values('Beginner', 'Intermediate', 'Expert')
 * @apiParam {Array} [steps] Steps of Exercise
 * @apiParam {Array} [tips] tips of Exercise
 * @apiParam {Files} [images] Images of Exercise
 * @apiSuccess (Success 200) {JSON} exercise Exercise details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:exercise_id", async (req, res) => {
  var exercise_id = mongoose.Types.ObjectId(req.params.exercise_id);
  var schema = {
    name: {
      notEmpty: true,
      isLength: {
        errorMessage: "Name should be between 3 to 150 characters",
        options: {
          min: 3,
          max: 150
        }
      },
      errorMessage: "Name is required"
    },
    mainMuscleGroup: {
      notEmpty: true,
      errorMessage: "Main Muscle is required"
    },
    category: {
      notEmpty: true,
      isIn: {
        options: [constants.EXERCISES_CATEGORIES],
        errorMessage: "Please select valid Category"
      },
      errorMessage: "Category is required"
    },
    equipments: {
      notEmpty: true,
      errorMessage: "Equipments is required"
    },
    difficltyLevel: {
      notEmpty: true,
      errorMessage: "Difficlty Level is required"
    },
    status: {
      notEmpty: true,
      errorMessage: "Status is required"
    }
  };
  if (req.body.category && req.body.category !== "balance") {
    schema.subCategory = {
      notEmpty: true,
      isIn: {
        options: [constants.EXERCISES_SUBCATEGORIES],
        errorMessage: "Please enter valid Sub category "
      },
      errorMessage: "Sub Category is required"
    };
  }

  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    let count = await exercise_helper.count_exercises({
      name: req.body.name,
      _id: { $ne: exercise_id }
    });
    if (count.status === 1 && count.count > 0) {
      logger.error("Name Validation Error = ");
      return res.status(config.VALIDATION_FAILURE_STATUS).json({
        message: [{
          msg: "Name already exists"
        }]
      });
    }
    var exercise_obj = {
      name: req.body.name,
      mainMuscleGroup: req.body.mainMuscleGroup,
      category: req.body.category,
      difficltyLevel: req.body.difficltyLevel,
      status: req.body.status,
      modifiedAt: new Date()
    };

    if (req.body.equipments) {
      let equipmentsData = [];
      JSON.parse(req.body.equipments).forEach(element => {
        equipmentsData.push(mongoose.Types.ObjectId(element));
      });
      exercise_obj.equipments = equipmentsData;
    }

    if (req.body.description) {
      exercise_obj.description = req.body.description;
    }
    if (req.body.otherMuscleGroup) {
      let otherMuscleGroupData = [];
      JSON.parse(req.body.otherMuscleGroup).forEach(element => {
        otherMuscleGroupData.push(mongoose.Types.ObjectId(element));
      });
      exercise_obj.otherMuscleGroup = otherMuscleGroupData;
    }
    if (req.body.detailedMuscleGroup) {
      let detailedMuscleGroupData = [];
      JSON.parse(req.body.detailedMuscleGroup).forEach(element => {
        detailedMuscleGroupData.push(mongoose.Types.ObjectId(element));
      });
      exercise_obj.detailedMuscleGroupData = detailedMuscleGroupData;
    }
    if (req.body.mechanics) {
      exercise_obj.mechanics = req.body.mechanics;
    }
    if (typeof req.body.subCategory != "undefined") {
      exercise_obj.subCategory = req.body.subCategory;
    }
    if (req.body.steps) {
      exercise_obj.steps = JSON.parse(req.body.steps);
    }
    if (req.body.tips) {
      exercise_obj.tips = JSON.parse(req.body.tips);
    }
    // var resp_data = await exercise_helper.get_exercise_id({
    //   _id: exercise_id
    // });
    // new_img_path_list = resp_data.exercise.images;

    async.waterfall(
      [
        // function (callback) {
        //   // if (
        //   //   req.body.delete_images &&
        //   //   typeof JSON.parse(req.body.delete_images) === "object"
        //   // ) {
        //   //   delete_image = [].concat(JSON.parse(req.body.delete_images));
        //   //   delete_image.forEach(element => {
        //   //     var index = new_img_path_list.indexOf(element);

        //   //     if (index > -1) {
        //   //       fs.unlink(element, function () {});

        //   //       new_img_path_list.splice(index, 1);
        //   //     }
        //   //   });
        //   // }
        //   // callback(null, new_img_path_list);
        // },
        function (callback) {
          //image upload
          var file_path_array = [];

          if (req.files && req.files["images"] && req.files != null) {
            var files = [].concat(req.files.images);

            var dir = "./uploads/exercise";
            var mimetype = ["image/png", "image/jpeg", "image/jpg"];

            // assuming openFiles is an array of file names
            async.eachSeries(
              files,
              function (file, loop_callback) {
                if (mimetype.indexOf(file.mimetype) != -1) {
                  if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                  }
                  extention = path.extname(file.name);
                  filename = "exercise_" + new Date().getTime() + extention;
                  file.mv(dir + "/" + filename, function (err) {
                    if (err) {
                      logger.error("There was an issue in uploading image");
                      loop_callback({
                        status: config.MEDIA_ERROR_STATUS,
                        err: "There was an issue in uploading image"
                      });
                    } else {
                      logger.trace(
                        "image has been uploaded. Image name = ",
                        filename
                      );
                      location = "uploads/exercise/" + filename;
                      file_path_array.push(location);
                      loop_callback();
                    }
                  });
                } else {
                  logger.error("Image format is invalid");
                  loop_callback({
                    message: [{
                      "msg": "Invalid file(s). Please select jpg, png, gif only."
                    },],
                    status: config.VALIDATION_FAILURE_STATUS,
                  });
                }
              },
              function (err) {
                // if any of the file processing produced an error, err would equal that error
                if (err) {
                  res.status(err.status).json(err);
                } else {
                  callback(null, file_path_array);
                }
              }
            );
          } else {
            logger.info(
              "Image not available to upload. Executing next instruction"
            );
            callback(null, file_path_array);
          }
        }
      ],
      async (err, file_path_array) => {
        //End image upload
        if (file_path_array.length !== 0) {
          exercise_obj.images = file_path_array;
        }

        let exercise_data = await exercise_helper.update_exercise_by_id(
          req.params.exercise_id,
          exercise_obj
        );

        if (exercise_data.status === 0) {
          logger.error("Error while updating exercise data = ", exercise_data);
          res.status(config.INTERNAL_SERVER_ERROR).json({
            exercise_data
          });
        } else {
          logger.error("successfully updated exercise data = ", exercise_data);
          res.status(config.OK_STATUS).json(exercise_data);
        }
      }
    );
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

/**
 * @api {put} /admin/exercise/undo/:exercise_id Undo
 * @apiName Undo
 * @apiGroup Exercise
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/undo/:exercise_id", async (req, res) => {
  logger.trace("Undo Exercise API - Id = ", req.params.exercise_id);
  let exercise_data = await exercise_helper.update_exercise_by_id(
    req.params.exercise_id,
    {
      isDeleted: 0
    }
  );
  if (exercise_data.status === 1) {
    exercise_data.message = "Exercise recovered";
    logger.trace("Exercise undo Successfully = ", req.params.exercise_id);
    res.status(config.OK_STATUS).json(exercise_data);
  } else {
    exercise_data.message = "Exercise could not recovered";
    logger.error(
      "Exercise not recovered Successfully = ",
      req.params.exercise_id
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(exercise_data);
  }
});

/**
 * @api {delete} /admin/exercise/:exercise_id Delete
 * @apiName Delete
 * @apiGroup Exercise
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:exercise_id", async (req, res) => {
  logger.trace("Delete Exercise API - Id = ", req.params.exercise_id);
  let exercise_data = await exercise_helper.update_exercise_by_id(
    req.params.exercise_id,
    {
      isDeleted: 1
    }
  );
  if (exercise_data.status === 1) {
    exercise_data.message = "Exercise deleted";
    logger.trace("Exercise deleted Successfully = ", req.params.exercise_id);
    res.status(config.OK_STATUS).json(exercise_data);
  } else {
    exercise_data.message = "Exercise could not deleted";
    logger.error(
      "Exercise not deleted Successfully = ",
      req.params.exercise_id
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(exercise_data);
  }
});

module.exports = router;
