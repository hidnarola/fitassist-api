var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");

var router = express.Router();

var config = require("../../config");
var logger = config.logger;

var exercise_helper = require("../../helpers/exercise_helper");
var filter_helper = require("../../helpers/search_filter_helper");
var common_helper = require("../../helpers/common_helper");


/**
 * @api {post} /admin/exercise/filter Exercise Filter
 * @apiName Exercise Exercise Filter
 * @apiGroup Admin
 * 
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * 
 * @apiParam {Object} columnFilter columnFilter Object for filter data
 * @apiParam {Object} columnSort columnSort Object for Sorting Data
 * @apiParam {Object} columnFilterEqual columnFilterEqual Object for select box
 * @apiParam {Number} pageSize pageSize

 * @apiSuccess (Success 200) {JSON} filtered_exercises filtered details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/filter", async (req, res) => {
//console.log(req.body);
// return res.send(req.body.columnFilter)));
 
  //return res.send(filter_object);
  // page              = req.body.page;
  // columnFilter      = req.body.columnFilter;
  // columnSort        = req.body.columnSort;
  // filter            = req.body.filter;
  // columnFilterEqual = req.body.columnFilterEqual;
  //common_helper.
  
  filter_object = common_helper.changeObject(req.body);
  let filtered_data = await filter_helper.get_filtered_records(filter_object);
  if (filtered_data.status === 0) {
    logger.error("Error while fetching searched data = ", filtered_data);
    return res.status(config.BAD_REQUEST).json({ filtered_data });
  } else {
    return res.status(config.OK_STATUS).json(filtered_data);
  }
});




/**
 * @api {get} /admin/exercise Exercise - Get all
 * @apiName Exercise - Get all
 * @apiGroup Admin
 *
 * @apiHeader {String}  x-access-token Admin's unique access-key
 *
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
 * @api {get} /admin/exercise/exercise_id Exercise - Get by ID
 * @apiName Exercise - Get Exercise by ID
 * @apiGroup Admin
 *
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * * @apiParam {String} exercise_id ID of Exercise

 * @apiSuccess (Success 200) {Array} exercise Array of Exercise document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:exercise_id", async (req, res) => {
  exercise_id = req.params.exercise_id;
  logger.trace("Get all exercise API called");
  var resp_data = await exercise_helper.get_exercise_id(exercise_id);
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching exercise = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("Exercises got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /admin/exercise Exercise Add
 * @apiName Exercise Exercise Add
 * @apiGroup Admin
 * 
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * 
 * @apiParam {String} name Name of Exercise
 * @apiParam {String} [description] Description of Exercise
 * @apiParam {String} mainMuscleGroup Reference id of from muscles group collection
 * @apiParam {Array} [otherMuscleGroup] Reference ids of from muscles group collection
 * @apiParam {Array} [detailedMuscleGroup] Reference ids of from muscles group collection
 * @apiParam {Array} [type] Type of exercise (reference id from exercise type collection)
 * @apiParam {Enum} [mechanics] Mechanics of Exercise | Possible Values('Compound', 'Isolation')
 * @apiParam {Array} equipments Reference ids from equipments collection
 * @apiParam {Enum} difficltyLevel Difficlty level of exercise | Possible Values('Beginner', 'Intermediate', 'Expert')
 * @apiParam {Array} [steps] Steps of Exercise
 * @apiParam {Files} [images] Images of Exercise
 * @apiParam {Enum} [measures] Measures of Exercise
 
 * @apiSuccess (Success 200) {JSON} exercise Exercise details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/", async (req, res) => {  
  console.log(req.files);

    
  var schema = {
    name: {
      notEmpty: true,
      errorMessage: "Name is required"
    },
    description: {
      notEmpty: false,
      errorMessage: "Description is required"
    },
    mainMuscleGroup: {
      notEmpty: true,
      errorMessage: "mainMuscleGroup is required"
    },
    otherMuscleGroup: {
      notEmpty: false,
      errorMessage: "otherMuscleGroup is required"
    },
    detailedMuscleGroup: {
      notEmpty: true,
      errorMessage: "detailedMuscleGroup is required"
    },
    type: {
      notEmpty: true,
      errorMessage: "type	 is required"
    },
    mechanics: {
      notEmpty: false,
      errorMessage: "mechanics is required"
    },
    equipments: {
      notEmpty: true,
      errorMessage: "equipments is required"
    },
    difficltyLevel: {
      notEmpty: true,
      errorMessage: "difficltyLevel is required"
    },
    steps: {
      notEmpty: false,
      errorMessage: "steps is required"
    },
    image: {
      notEmpty: false,
      errorMessage: "image is required"
    },
    measures: {
      notEmpty: false,
      errorMessage: "measures is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    //console.log("Data = ",req.body);
    //console.log("Files = ",req.files);
    var exercise_obj = {
      name: req.body.name,
      description: req.body.description,
      mainMuscleGroup: req.body.mainMuscleGroup,
      otherMuscleGroup: JSON.parse(req.body.otherMuscleGroup),
      detailedMuscleGroup: JSON.parse(req.body.detailedMuscleGroup),
      type: req.body.type,
      mechanics: req.body.mechanics,
      equipments: JSON.parse(req.body.equipments),
      difficltyLevel: req.body.difficltyLevel,
      steps: JSON.parse(req.body.steps),
      measures: req.body.measures
    };

    console.log(exercise_obj);
    //return res.send(exercise_obj);
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
        let exercise_data = await exercise_helper.insert_exercise(exercise_obj);
        if (exercise_data.status === 0) {
          logger.error("Error while inserting exercise data = ", exercise_data);
          return res.status(config.BAD_REQUEST).json({ exercise_data });
        } else {
          return res.status(config.OK_STATUS).json(exercise_data);
        }
      }
    );
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.BAD_REQUEST).json({ message: errors });
  }
});

/**
 * @api {put} /admin/exercise Exercise - Update
 * @apiName Exercise - Update
 * @apiGroup Admin
 *
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} name Name of Exercise
 * @apiParam {String} [description] Description of Exercise
 * @apiParam {String} mainMuscleGroup Reference id of from muscles group collection
 * @apiParam {Array} [otherMuscleGroup] Reference ids of from muscles group collection
 * @apiParam {Array} [detailedMuscleGroup] Reference ids of from muscles group collection
 * @apiParam {Array} [type] Type of exercise (reference id from exercise type collection)
 * @apiParam {Enum} [mechanics] Mechanics of Exercise | Possible Values('Compound', 'Isolation')
 * @apiParam {Array} equipments Reference ids from equipments collection
 * @apiParam {Enum} difficltyLevel Difficlty level of exercise | Possible Values('Beginner', 'Intermediate', 'Expert')
 * @apiParam {Array} [steps] Steps of Exercise
 * @apiParam {Array} [delete_images] Path of all images to be delete
 * @apiParam {File} [images] New Images of Exercise
 * @apiParam {Enum} [measures] Measures of Exercise
 * @apiSuccess (Success 200) {Array} exercise Array of Exercises document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:exercise_id", async (req, res) => {

  // return res.send({"after delete":new_img_path_list});
  var schema = {
    name: {
      notEmpty: true,
      errorMessage: "Name is required"
    },
    description: {
      notEmpty: false,
      errorMessage: "Description is required"
    },
    mainMuscleGroup: {
      notEmpty: true,
      errorMessage: "mainMuscleGroup is required"
    },
    otherMuscleGroup: {
      notEmpty: false,
      errorMessage: "otherMuscleGroup is required"
    },
    detailedMuscleGroup: {
      notEmpty: true,
      errorMessage: "detailedMuscleGroup is required"
    },
    type: {
      notEmpty: true,
      errorMessage: "type	 is required"
    },
    mechanics: {
      notEmpty: false,
      errorMessage: "mechanics is required"
    },
    equipments: {
      notEmpty: true,
      errorMessage: "equipments is required"
    },
    difficltyLevel: {
      notEmpty: true,
      errorMessage: "difficltyLevel is required"
    },
    steps: {
      notEmpty: false,
      errorMessage: "steps is required"
    },
    image: {
      notEmpty: false,
      errorMessage: "image is required"
    },
    measures: {
      notEmpty: false,
      errorMessage: "measures is required"
    }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    //console.log("Data = ",req.body);
    //console.log("Files = ",req.files);
    var exercise_obj = {
      name: req.body.name,
      description: req.body.description,
      mainMuscleGroup: req.body.mainMuscleGroup,
      otherMuscleGroup: JSON.parse(req.body.otherMuscleGroup),
      detailedMuscleGroup: JSON.parse(req.body.detailedMuscleGroup),
      type: req.body.type,
      mechanics: req.body.mechanics,
      equipments: JSON.parse(req.body.equipments),
      difficltyLevel: req.body.difficltyLevel,
      steps: JSON.parse(req.body.steps),
      measures: req.body.measures
    };
    exercise_id = req.params.exercise_id;

    var resp_data = await exercise_helper.get_exercise_id(exercise_id);
    new_img_path_list = resp_data["exercise"]["images"];
    

    async.waterfall(
      [
        function(callback) {
          if (
            req.body.delete_images &&
            typeof JSON.parse(req.body.delete_images) === "object"
          ) {
            delete_image = [].concat(JSON.parse(req.body.delete_images));
            delete_image.forEach(element => {
              var index = new_img_path_list.indexOf(element);

              if (index > -1) {
                
             fs.unlink(element,function(){
              console.log("Image deleted: "+element);
             });
       
                new_img_path_list.splice(index, 1);
              }
            });
          }
          callback(null,new_img_path_list)
        },
        function(new_img_path_list,callback) {
          //image upload
          var file_path_array = new_img_path_list;
          //console.log(new_img_path_list);
          if (req.files && req.files["images"] && req.files != null) {

              console.log('hey');
            // var files = req.files['images'];
            var files = [].concat(req.files.images);

            var dir = "./uploads/exercise";
            var mimetype = ["image/png", "image/jpeg", "image/jpg"];

            // assuming openFiles is an array of file names
            async.eachSeries(
              files,
              function(file, loop_callback) {
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
                      console.log(file_path_array);
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
            callback(null, file_path_array);
          }
        }
      ],
      async (err, file_path_array) => {
        //End image upload
        exercise_obj.images = file_path_array;
        console.log(exercise_obj);
        let exercise_data = await exercise_helper.update_exercise_by_id(
          req.params.exercise_id,
          exercise_obj
        );
        if (exercise_data.status === 0) {
          logger.error("Error while updating exercise data = ", exercise_data);
          res.status(config.BAD_REQUEST).json({ exercise_data });
        } else {
          res.status(config.OK_STATUS).json(exercise_data);
        }
      }
    );
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.BAD_REQUEST).json({ message: errors });
  }
});

/**
 * @api {delete} /admin/exercise/:exercise_id Exercise Delete
 * @apiName Exercise Delete
 * @apiGroup Admin
 *
 * @apiHeader {String}  x-access-token Admin's unique access-key
 *
 * @apiSuccess (Success 200) {String} Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:exercise_id", async (req, res) => {
  logger.trace("Delete Exercise API - Id = ", req.query.id);
  
  var resp_data = await exercise_helper.get_exercise_id(req.params.exercise_id);
  images= resp_data.exercise.images;
  

  let exercise_data = await exercise_helper.delete_exercise_by_id(
    req.params.exercise_id
  );
  if (exercise_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(exercise_data);
  } else {
    images= resp_data.exercise.images;
    images.forEach(image => {
      fs.unlink(image,function(){
        console.log("Image "+image+" is deleted")
      });
    });
    res.status(config.OK_STATUS).json(exercise_data);
  }
});



module.exports = router;
