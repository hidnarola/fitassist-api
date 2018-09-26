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
 * @apiSuccess (Success 200) {Array} filtered_test_exercises filtered details
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *  "status": 1,
 *  "message": "filtered data is found",
 *  "count": 2,
 *  "filtered_total_pages": 1,
 *  "filtered_test_exercises": 
 *  [
 *    object array of data
 *  ]
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
 * @apiSuccess (Success 200) {JSON} test_exercise JSON of test_exercises document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:test_exercise_id", async (req, res) => {
  test_exercise_id = req.params.test_exercise_id;
  logger.trace("Get all test exercise API called");
  var resp_data = await test_exercise_helper.get_test_exercise_id({
    _id: test_exercise_id
  });
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
 * @apiParam {File} images image of test_exercise
 * @apiParam {File} featureImage feature Image of test_exercise
 * @apiParam {String} instructions instructions of test_exercise
 * @apiParam {Enum} format format of test_exercise<code>Enum:["max_rep", "multiselect", "a_or_b"]</code>
 * @apiParam {Object[]} [max_rep] max_rep of test_exercise
 * @apiParam {Object[]} [multiselect] multiselect of test_exercise
 * @apiParam {Object[]} [a_or_b] a_or_b of test_exercise
 * @apiParam {String} [textField] text Field of test_exercise
 * @apiSuccess (Success 200) {JSON} test_exercise added test_exercise detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/", async (req, res) => {
  var schema = {
    name: {
      notEmpty: true,
      isLength: {
        errorMessage: 'First Name should be between 2 to 100 characters',
        options: {
          min: 2,
          max: 100
        }
      },
      errorMessage: "Name is required"
    },
    category: {
      notEmpty: true,
      isIn: {
        options: [
          ["strength", "flexibility", "posture", "cardio"]
        ],
        errorMessage: "Category must be from strength, flexibility, posture or cardio"
      },
      errorMessage: "Category of test exercies is required"
    },
    subCategory: {
      notEmpty: true,
      isIn: {
        options: [
          ["upper_body", "side", "lower_body", "cardio"]
        ],
        errorMessage: "Sub category must be from Upper body, Side, Lower body or Cardio"
      },
      errorMessage: "Sub Category of test exercies is required"
    },
    format: {
      notEmpty: true,
      isIn: {
        options: [
          ["max_rep", "multiselect", "a_or_b", "text_field"]
        ],
        errorMessage: "Format must be from (Max Rep), (Multiselect), (Text field), (A or B)"
      },
      errorMessage: "Format is required"
    }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var test_exercise_obj = {
      name: req.body.name,
      category: req.body.category,
      subCategory: req.body.subCategory,
      format: req.body.format
    };

    if (req.body.instructions) {
      test_exercise_obj.instructions = req.body.instructions;
    }
    if (req.body.description) {
      test_exercise_obj.description = req.body.description;
    }
    if (req.body.textField) {
      test_exercise_obj.textField = req.body.textField;
    }
    //image upload
    var filename;
    if (req.files && req.files["featureImage"]) {
      var file = req.files["featureImage"];
      var dir = "./uploads/test_exercise";
      var mimetype = ["image/png", "image/jpeg", "image/jpg"];

      if (mimetype.indexOf(file.mimetype) != -1) {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
        extention = path.extname(file.name);
        filename = "feature_image_" + new Date().getTime() + extention;
        file.mv(dir + "/" + filename, function (err) {
          if (err) {
            logger.error("There was an issue in uploading feature Image");
          } else {
            logger.trace(
              "feature Image has been uploaded. Image name = ",
              filename
            );
          }
        });
      } else {
        logger.error("feature Image format is invalid");
      }
    }
    if (filename) {
      test_exercise_obj.featureImage = "uploads/test_exercise/" + filename;
    }

    //End image upload
    if (req.body.format == "max_rep") {
      if (req.body.max_rep) {
        test_exercise_obj.max_rep = JSON.parse(req.body.max_rep);
      }

      let test_exercise_data = await test_exercise_helper.insert_test_exercise(
        test_exercise_obj
      );
      if (test_exercise_data.status === 0) {
        logger.error(
          "Error while inserting test exercise  data = ",
          test_exercise_data
        );
        return res.status(config.INTERNAL_SERVER_ERROR).json(test_exercise_data);
      } else {
        return res.status(config.OK_STATUS).json(test_exercise_data);
      }
    } else {
      async.waterfall(
        [
          function (callback) {
            //image upload
            if (req.files && req.files["images"]) {
              var file_path_array = [];
              // var files = req.files['images'];
              var files = [].concat(req.files.images);
              var dir = "./uploads/test_exercise";
              var mimetype = ["image/png", "image/jpeg", "image/jpg"];

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
                    filename =
                      "test_exercise_" + new Date().getTime() + extention;
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
                        location = "uploads/test_exercise/" + filename;
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
          var data = [];
          var obj = {};

          if (req.body.title && req.body.title != null) {
            var titles = JSON.parse(req.body.title);
            for (let i = 0; i < titles.length; i++) {
              obj = {
                title: titles[i],
                image: file_path_array[i]
              };
              data.push(obj);
            }
          }
          if (req.body.format && req.body.format == "multiselect") {
            test_exercise_obj.multiselect = data;
          }
          if (req.body.format && req.body.format == "a_or_b") {
            test_exercise_obj.a_or_b = data;
          }
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
        }
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
 * @api {put} /admin/test_exercise/undo/:test_exercise_id Undo
 * @apiName Undo
 * @apiGroup  Test Exercises
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {String} test_exercise test exercise detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/undo/:test_exercise_id", async (req, res) => {
  logger.trace("Undo test exercises API - Id = ", req.body.test_exercise_id);
  let test_exercise_data = await test_exercise_helper.update_test_exercise_by_id({
    _id: req.params.test_exercise_id
  }, {
    isDeleted: 0
  });
  if (test_exercise_data.status === 1) {
    test_exercise_data.message = "Record recovered";
    res.status(config.OK_STATUS).json(test_exercise_data);
  } else {
    test_exercise_data.message = "Could not recover record";
    res.status(config.INTERNAL_SERVER_ERROR).json(test_exercise_data);
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
 * @apiParam {File} [featureImage] feature Image of test_exercise
 * @apiParam {File} images image of test_exercise
 * @apiParam {String} instructions instructions of test_exercise
 * @apiParam {Enum} format format of test_exercise<code>Enum:["max_rep", "multiselect", "a_or_b"]</code>
 * @apiParam {Object[]} [max_rep] max_rep of test_exercise
 * @apiParam {Object[]} [multiselect] multiselect of test_exercise
 * @apiParam {Object[]} [a_or_b] a_or_b of test_exercise
 * @apiParam {String} [textField] text Field of test_exercise
 * @apiParam {Number[]} [delete_multiselect_image_ids] delete multiselect image ids of test_exercise's image records
 * @apiSuccess (Success 200) {JSON} test_exercise updated test_exercise detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:test_exercise_id", async (req, res) => {
  test_exercise_id = req.params.test_exercise_id;
  var schema = {
    name: {
      notEmpty: true,
      isLength: {
        errorMessage: 'First Name should be between 2 to 100 characters',
        options: {
          min: 2,
          max: 100
        }
      },
      errorMessage: "Name is required"
    },
    category: {
      notEmpty: true,
      isIn: {
        options: [
          ["strength", "flexibility", "posture", "cardio"]
        ],
        errorMessage: "Category must be from strength, flexibility, posture or cardio"
      },
      errorMessage: "Category of test exercies is required"
    },
    subCategory: {
      notEmpty: true,
      isIn: {
        options: [
          ["upper_body", "side", "lower_body", "cardio"]
        ],
        errorMessage: "Sub category must be from Upper body, Side, Lower body or Cardio"
      },
      errorMessage: "Sub Category of test exercies is required"
    },
    format: {
      notEmpty: true,
      isIn: {
        options: [
          ["max_rep", "multiselect", "a_or_b", "text_field"]
        ],
        errorMessage: "Format must be from (Max Rep), (Multiselect), (Text field), (A or B)"
      },
      errorMessage: "Format is required"
    },
    status: {
      notEmpty: true,
      errorMessage: "Status is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var test_exercise_obj = {
      name: req.body.name,
      category: req.body.category,
      subCategory: req.body.subCategory,
      format: req.body.format,
      status: req.body.status,
      modifiedAt: new Date()
    };
    if (req.body.description) {
      test_exercise_obj.description = req.body.description;
    }
    if (req.body.instructions) {
      test_exercise_obj.instructions = req.body.instructions;
    }
    if (req.body.textField) {
      test_exercise_obj.textField = req.body.textField;
    }
    //image upload
    var filename;
    if (req.files && req.files["featureImage"]) {
      var file = req.files["featureImage"];
      var dir = "./uploads/test_exercise";
      var mimetype = ["image/png", "image/jpeg", "image/jpg"];

      if (mimetype.indexOf(file.mimetype) != -1) {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
        extention = path.extname(file.name);
        filename = "feature_image_" + new Date().getTime() + extention;
        file.mv(dir + "/" + filename, function (err) {
          if (err) {
            logger.error("There was an issue in uploading feature Image");
          } else {
            logger.trace(
              "feature Image has been uploaded. Image name = ",
              filename
            );
          }
        });
      } else {
        logger.error("feature Image format is invalid");
      }
    }
    if (filename) {
      test_exercise_obj.featureImage = "uploads/test_exercise/" + filename;
    }

    //End image upload
    if (req.body.format == "max_rep") {
      if (req.body.max_rep) {
        test_exercise_obj.max_rep = JSON.parse(req.body.max_rep);
      }
      if (req.body.title) {
        test_exercise_obj.title = JSON.parse(req.body.title);
      }
      // return;
      test_exercise_obj.multiselect = [];
      test_exercise_obj.a_or_b = [];
      let test_exercise_data = await test_exercise_helper.update_test_exercise_by_id(
        test_exercise_id,
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
      async.waterfall(
        [
          function (callback) {
            //image upload
            if (req.files && req.files["images"]) {
              var file_path_array = [];
              // var files = req.files['images'];
              var files = [].concat(req.files.images);
              var dir = "./uploads/test_exercise";
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
                    filename =
                      "test_exercise_" + new Date().getTime() + extention;
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
                        location = "uploads/test_exercise/" + filename;
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
          var data = [];
          var oldData = {};
          var resp_data = await test_exercise_helper.get_test_exercise_id({
            _id: test_exercise_id
          });
          if (test_exercise_obj.featureImage != null) {
            try {
              fs.unlink(resp_data.test_exercise.featureImage, function () {});
            } catch (err) {}
          }
          if (resp_data.status == 1) {
            if (req.body.format == "multiselect") {
              oldData = resp_data.test_exercise.multiselect;
            } else {
              oldData = resp_data.test_exercise.a_or_b;
            }
            if (req.body.format == "a_or_b") {
              var titles = JSON.parse(req.body.title);

              if (req.body.a_b_updateImageIndex) {
                var a_b_updateImageIndex = req.body.a_b_updateImageIndex ?
                  JSON.parse(req.body.a_b_updateImageIndex) : [];
                var a_b_updateImageIndexLength = a_b_updateImageIndex.length ?
                  a_b_updateImageIndex.length :
                  0;
              }
              titles.forEach((title, index) => {
                try {
                  var url = oldData[index].image;
                } catch (error) {}
                if (
                  a_b_updateImageIndexLength > 0 &&
                  a_b_updateImageIndex.indexOf(index) >= 0
                ) {
                  try {
                    fs.unlink(oldData[index].image, async () => {});
                  } catch (err) {}
                  if (a_b_updateImageIndexLength > 1) {
                    url = file_path_array[index];
                  } else if (a_b_updateImageIndexLength == 1) {
                    url = file_path_array[0];
                  }
                }
                data.push({
                  title: title,
                  image: url
                });
              });
            } else if (req.body.format == "multiselect") {
              var delete_multiselect_image_ids = req.body
                .delete_multiselect_image_ids ?
                JSON.parse(req.body.delete_multiselect_image_ids) : [];

              oldData.forEach((save_data, index) => {
                if (delete_multiselect_image_ids.indexOf(save_data._id.toString()) >= 0) {
                  try {
                    fs.unlink(save_data.image, function () {});
                  } catch (err) {}
                } else {
                  data.push(save_data);
                }
              });
              if (req.body.title) {
                var titles = JSON.parse(req.body.title);
                titles.forEach((title, index) => {
                  data.push({
                    title: title,
                    image: file_path_array[index]
                  });
                });
              }
            }
            if (req.body.format && req.body.format == "multiselect") {
              test_exercise_obj.multiselect = data;
              test_exercise_obj.max_rep = [];
              test_exercise_obj.a_or_b = [];
            }
            if (req.body.format && req.body.format == "a_or_b") {
              test_exercise_obj.a_or_b = data;
              test_exercise_obj.max_rep = [];
              test_exercise_obj.multiselect = [];
            }
            if (req.body.format && req.body.format == "text_field") {
              test_exercise_obj.a_or_b = [];
              test_exercise_obj.max_rep = [];
              test_exercise_obj.multiselect = [];
            }

            let test_exercise_data = await test_exercise_helper.update_test_exercise_by_id(test_exercise_id, test_exercise_obj);
            if (test_exercise_data.status === 0) {
              logger.error("Error while updating test exercise  data = ", test_exercise_data);
              return res.status(config.INTERNAL_SERVER_ERROR).json(test_exercise_data);
            } else {
              return res.status(config.OK_STATUS).json(test_exercise_data);
            }
          }
        }
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
 * @api {delete} /admin/test_exercise/:test_exercise_id Delete
 * @apiName Delete
 * @apiGroup  Test Exercises
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:test_exercise_id", async (req, res) => {
  logger.trace("Delete test exercises API - Id = ", req.body.test_exercise_id);
  let test_exercise_data = await test_exercise_helper.update_test_exercise_by_id({
    _id: req.params.test_exercise_id
  }, {
    isDeleted: 1
  });
  if (test_exercise_data.status === 1) {
    test_exercise_data.message = "Record has been deleted";
    logger.trace("Delete test exercises Id = ", req.body.test_exercise_id);
    res.status(config.OK_STATUS).json(test_exercise_data);
  } else {
    logger.error("Could not delete test exercises Id = ", req.body.test_exercise_id);
    res.status(config.INTERNAL_SERVER_ERROR).json(test_exercise_data);
  }
});



module.exports = router;