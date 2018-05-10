var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");

var router = express.Router();

var config = require("../../config");
var logger = config.logger;

var test_exercise_helper = require("../../helpers/test_exercise_helper");
var common_helper = require("../../helpers/common_helper");

/**
 * @api {post} /admin/test_exercise/filter Filter
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
 *}</code></pre>
 * @apiGroup Test Exercises
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
 *}</code></pre>
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 *
 * @apiParam {Object} columnFilter columnFilter Object for filter data
 * @apiParam {Object} columnSort columnSort Object for Sorting Data
 * @apiParam {Object} columnFilterEqual columnFilterEqual Object for select box
 * @apiParam {Number} pageSize pageSize
 * @apiParam {Number} page page number
 * @apiSuccess (Success 200) {JSON} filtered_badge_tasks filtered details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/filter", async (req, res) => {
  filter_object = common_helper.changeObject(req.body);
  let filtered_data = await test_exercise_helper.get_filtered_records(
    filter_object
  );
  if (filtered_data.status === 0) {
    logger.error("Error while fetching searched data = ", filtered_data);
    return res.status(config.BAD_REQUEST).json(filtered_data);
  } else {
    return res.status(config.OK_STATUS).json(filtered_data);
  }
});

/**
 * @api {get} /admin/test_exercise Get all
 * @apiName Get all
 * @apiGroup  Test Exercises
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} test_exercises Array of test_exercises document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  logger.trace("Get all test_exercises API called");
  var resp_data = await test_exercise_helper.get_test_exercises();
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching  test_exercises = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("test exercies got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});
/**
 * @api {get} /admin/test_exercise/test_exercise_id Get by ID
 * @apiName Get Test Exercises by ID
 * @apiGroup  Test Exercises
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} test_exercise Array of test_exercises document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:test_exercise_id", async (req, res) => {
  test_exercise_id = req.params.test_exercise_id;
  logger.trace("Get all test exercise API called");
  var resp_data = await test_exercise_helper.get_test_exercise_id(
    test_exercise_id
  );
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching test exercise = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("test exercise got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /admin/test_exercise  Add
 * @apiName Add
 * @apiGroup  Test Exercises
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} name Name of test_exercise
 * @apiParam {Enum} category category of test_exercise<code>Enum:["strength", "flexibility", "posture", "cardio"]</code>
 * @apiParam {Enum} subCategory subCategory of test_exercise<code>Enum:["upper_body", "side", "lower_body", "cardio"]</code>
 * @apiParam {String} [description] description of test_exercise
 * @apiParam {File} image image of test_exercise
 * @apiParam {String} instructions instructions of test_exercise
 * @apiParam {Enum} format format of test_exercise<code>Enum:["max_rep", "multiselect", "text_field", "a_or_b"]</code>
 * @apiParam {Object[]} [max_rep] max_rep of test_exercise
 * @apiParam {Object[]} [multiselect] multiselect of test_exercise
 * @apiParam {Object} [text_field] text_field of test_exercise
 * @apiParam {Object[]} [a_or_b] a_or_b of test_exercise
 * @apiSuccess (Success 200) {JSON} test_exercise added test_exercise detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/", async (req, res) => {
  var schema = {
    name: {
      notEmpty: true,
      errorMessage: "Name of test exercies is required"
    },
    category: {
      notEmpty: true,
      isIn: {
        options: [["strength", "flexibility", "posture", "cardio"]],
        errorMessage:
          "Category must be from strength, flexibility, posture or cardio"
      },
      errorMessage: "category of test exercies is required"
    },
    subCategory: {
      notEmpty: true,
      isIn: {
        options: [["upper_body", "side", "lower_body", "cardio"]],
        errorMessage:
          "Sub category must be from upper_body, side, lower_body or cardio"
      },
      errorMessage: "subCategory of test exercies is required"
    },
    instructions: {
      notEmpty: true,
      errorMessage: "instructions of test exercies is required"
    },
    format: {
      notEmpty: true,
      isIn: {
        options: [["max_rep", "multiselect", "text_field", "a_or_b"]],
        errorMessage:
          "format must be from max_rep, multiselect, text_field or a_or_b"
      },
      errorMessage: "format is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var test_exercise_obj = {
      name: req.body.name,
      category: req.body.category,
      subCategory: req.body.subCategory,
      instructions: req.body.instructions,
      format: req.body.format
    };
    if (req.body.description) {
      test_exercise_obj.description = req.body.description;
    }
    if (req.body.max_rep) {
      test_exercise_obj.max_rep = JSON.parse(req.body.max_rep);
    }
    if (req.body.text_field) {
      test_exercise_obj.text_field = JSON.parse(req.body.text_field);
    }

    if (req.body.format == "max_rep" || req.body.format == "text_field") {
      if (req.body.max_rep) {
        test_exercise_obj.max_rep = JSON.parse(req.body.max_rep);
      }
      if (req.body.title) {
        test_exercise_obj.title = JSON.parse(req.body.title);
      }
      // console.log(test_exercise_obj);
      // return;
      let test_exercise_data = await test_exercise_helper.insert_test_exercise(
        test_exercise_obj
      );
      if (test_exercise_data.status === 0) {
        logger.error(
          "Error while inserting test exercise  data = ",
          test_exercise_data
        );
        return res.status(config.BAD_REQUEST).json(test_exercise_data);
      } else {
        return res.status(config.OK_STATUS).json(test_exercise_data);
      }
    } else {
      return res.send("else");
      async.waterfall(
        [
          function(callback) {
            //image upload
            if (req.files && req.files["images"]) {
              var file_path_array = [];
              // var files = req.files['images'];
              var files = [].concat(req.files.images);
              var dir = "./uploads/exercise";
              var mimetype = ["image/png", "image/jpeg", "image/jpg"];

              // assuming openFiles is an array of file names
              async.eachSeries(
                files,
                function(file, loop_callback) {
                  var mimetype = ["image/png", "image/jpeg", "image/jpg"];
                  if (mimetype.indexOf(file.mimetype) != -1) {
                    if (!fs.existsSync(dir)) {
                      fs.mkdirSync(dir);
                    }
                    extention = path.extname(file.name);
                    filename = "exercise_" + new Date().getTime() + extention;
                    file.mv(dir + "/" + filename, function(err) {
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
                      status: config.VALIDATION_FAILURE_STATUS,
                      err: "Image format is invalid"
                    });
                  }
                },
                function(err) {
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
          let exercise_data = await exercise_helper.insert_exercise(
            exercise_obj
          );
          if (exercise_data.status === 0) {
            logger.error(
              "Error while inserting exercise data = ",
              exercise_data
            );
            return res.status(config.BAD_REQUEST).json({ exercise_data });
          } else {
            return res.status(config.OK_STATUS).json(exercise_data);
          }
        }
      );
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.BAD_REQUEST).json({ message: errors });
  }
});

/**
 * @api {put} /admin/test_exercise  Update
 * @apiName Update
 * @apiGroup  Test Exercises
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} name Name of test_exercise
 * @apiParam {Enum} category category of test_exercise<code>Enum:["strength", "flexibility", "posture", "cardio"]</code>
 * @apiParam {Enum} subCategory subCategory of test_exercise<code>Enum:["upper_body", "side", "lower_body", "cardio"]</code>
 * @apiParam {String} [description] description of test_exercise
 * @apiParam {File} image image of test_exercise
 * @apiParam {String} instructions instructions of test_exercise
 * @apiParam {Enum} format format of test_exercise<code>Enum:["max_rep", "multiselect", "text_field", "a_or_b"]</code>
 * @apiParam {Object[]} [max_rep] max_rep of test_exercise
 * @apiParam {Object[]} [multiselect] multiselect of test_exercise
 * @apiParam {Object} [text_field] text_field of test_exercise
 * @apiParam {Object[]} [a_or_b] a_or_b of test_exercise
 * @apiSuccess (Success 200) {JSON} test_exercise added test_exercise detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:test_exercise_id", async (req, res) => {
  test_exercise_id = req.params.test_exercise_id;
  console.log(test_exercise_id);
  var schema = {
    name: {
      notEmpty: true,
      errorMessage: "Name of Task is required"
    },
    unit: {
      notEmpty: true,
      isIn: {
        options: [["kgs", "kms"]],
        errorMessage: "Unit must be from kgs or kms"
      },
      errorMessage: "Unit is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var test_exercise_obj = {
      name: req.body.name,
      unit: req.body.unit,
      description: req.body.description ? req.body.description : null,
      status: req.body.status
    };

    let test_exercise_data = await test_exercise_helper.update_badge_task_by_id(
      test_exercise_id,
      test_exercise_obj
    );
    if (test_exercise_data.status === 0) {
      logger.error(
        "Error while updating test_exercises data = ",
        test_exercise_data
      );
      return res.status(config.BAD_REQUEST).json(test_exercise_data);
    } else {
      return res.status(config.OK_STATUS).json(test_exercise_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.BAD_REQUEST).json({ message: errors });
  }
});

/**
 * @api {delete} /admin/test_exercise/:test_exercise_id Delete
 * @apiName Delete
 * @apiGroup  Test Exercises
 *
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {String} Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:test_exercise_id", async (req, res) => {
  logger.trace("Delete test_exercises API - Id = ", req.body.test_exercise_id);
  let test_exercise_data = await test_exercise_helper.delete_badge_task_by_id(
    req.params.test_exercise_id
  );

  if (test_exercise_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(test_exercise_data);
  } else {
    res.status(config.OK_STATUS).json(test_exercise_data);
  }
});

module.exports = router;
