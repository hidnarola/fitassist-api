var express = require("express");
var fs = require("fs");
var path = require("path");
var router = express.Router();
var config = require("../../config");
var mongoose = require("mongoose");
var logger = config.logger;
var equipment_helper = require("../../helpers/equipment_helper");
var common_helper = require("../../helpers/common_helper");

/**
 * @api {post} /admin/equipment/filter Filter
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
      value: "amc@narola.email"
    }
  ]
}</code></pre>
 * @apiGroup Equipment
 * 
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * 
 * @apiParam {Object} columnFilter columnFilter Object for filter data
 * @apiParam {Object} columnSort columnSort Object for Sorting Data
 * @apiParam {Object} columnFilterEqual columnFilterEqual Object for select box
 * @apiParam {Number} pageSize pageSize
 * @apiParam {Number} page page number
 * @apiSuccess (Success 200) {JSON} filtered_equipments filtered details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/filter", async (req, res) => {
  filter_object = common_helper.changeObject(req.body);
  let filtered_data = await equipment_helper.get_filtered_records(
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
 * @api {get} /admin/equipment Get all
 * @apiName Get all
 * @apiGroup Equipment
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} equipments Array of equipments document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  logger.trace("Get all equipment API called");
  var resp_data = await equipment_helper.get_all_equipment({ isDeleted: 0 });
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching equipment = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("Equipments got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {get} /admin/equipment/:equipment_id Get by ID
 * @apiName Get equipment by ID
 * @apiGroup Equipment
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Object} equipment Object of equipment document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:equipment_id", async (req, res) => {
  logger.trace("Get by equipment id API called: " + req.params.equipment_id);
  var resp_data = await equipment_helper.get_equipment_id(req.params.equipment_id);
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching equipment = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("Equipments got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /admin/equipment Add
 * @apiName  Add
 * @apiGroup Equipment
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} category_id Equipment's Category id
 * @apiParam {String} name Name of Equipment Equipment
 * @apiParam {Boolean} status status of Equipment
 * @apiParam {String} [description] Description of Equipment
 * @apiParam {File} [equipment_img] Equipment image
 * @apiSuccess (Success 200) {JSON} equipment Equipment details
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
      errorMessage: "Name is required"
    },
    category_id: {
      notEmpty: true,
      errorMessage: "Category is required"
    },
    status: {
      notEmpty: true,
      errorMessage: "Status is required"
    }
  };


  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {
    var equipment_obj = {
      name: req.body.name,
      category_id: req.body.category_id,
      status: req.body.status
    };
    if (req.body.description) {
      equipment_obj.description = req.body.description;
    }
    //image upload
    var filename;
    if (req.files && req.files["equipment_img"]) {
      var file = req.files["equipment_img"];
      var dir = "./uploads/equipment";
      var mimetype = ["image/png", "image/jpeg", "image/jpg"];

      if (mimetype.indexOf(file.mimetype) != -1) {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
        extention = path.extname(file.name);
        filename = "equipment_" + new Date().getTime() + extention;
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
    }
    if (filename) {
      equipment_obj.image = "uploads/equipment/" + filename;
    }

    //End image upload

    let equipment_data = await equipment_helper.insert_equipment(equipment_obj);
    if (equipment_data.status == 0) {
      logger.error("Error while inserting equipment = ", equipment_data);
      res.status(config.INTERNAL_SERVER_ERROR).json({
        equipment_data
      });
    } else {
      logger.trace("successfully inserted equipment = ", equipment_data);
      res.status(config.OK_STATUS).json(equipment_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

/**
 * @api {put} /admin/equipment/:equipment_id Update
 * @apiName Update
 * @apiGroup Equipment
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} name Name of equipment Equipment
 * @apiParam {String} [description] Description of equipment
 * @apiParam {File} [equipment_img] Equipment image
 * @apiParam {String} category_id Equipment's Category id
 * @apiParam {Boolean} status Status for equipment
 * @apiSuccess (Success 200) {JSON} equipment Equipment details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:equipment_id", async (req, res) => {
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
      errorMessage: "Name is required"
    },
    category_id: {
      notEmpty: true,
      errorMessage: "Category is required"
    },
    status: {
      notEmpty: true,
      errorMessage: "Status is required"
    }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {
    var equipment_obj = {
      name: req.body.name,
      category_id: req.body.category_id,
      status: req.body.status,
      modifiedAt: new Date()
    };
    if (req.body.description) {
      equipment_obj.description = req.body.description;
    }
    // Image upload
    var filename;
    if (req.files && req.files["equipment_img"]) {
      var file = req.files["equipment_img"];
      var dir = "./uploads/equipment";
      var mimetype = ["image/png", "image/jpeg", "image/jpg"];

      if (mimetype.indexOf(file.mimetype) != -1) {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
        extention = path.extname(file.name);
        filename = "equipment_" + new Date().getTime() + extention;
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

    //End image upload
    if (filename) {
      var resp_data = await equipment_helper.get_equipment_id(
        req.params.equipment_id
      );
      try {
        fs.unlink(resp_data.equipment.image, function (err, Success) {
          if (err) {
            logger.error("Image could not deleted = ", resp_data.equipment.image, err);
          }
        });
      } catch (error) { }
      equipment_obj.image = "uploads/equipment/" + filename;
    }

    let equipment_data = await equipment_helper.update_equipment_by_id(
      req.params.equipment_id,
      equipment_obj
    );
    if (equipment_data.status == 0) {
      logger.error("Error while updating equipment = ", equipment_data);
      res.status(config.INTERNAL_SERVER_ERROR).json({
        equipment_data
      });
    } else {
      logger.trace("equipment updated = ", equipment_data);
      res.status(config.OK_STATUS).json(equipment_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

/**
 * @api {delete} /admin/equipment/:equipment_id Delete
 * @apiName Delete
 * @apiGroup Equipment
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:equipment_id", async (req, res) => {
  logger.trace("Delete equipment API - Id = ", req.params.equipment_id);
  let equipment_data = await equipment_helper.delete_equipment_by_id({
    _id: mongoose.Types.ObjectId(req.params.equipment_id)
  }, {
      isDeleted: 1
    });

  if (equipment_data.status == 0) { } else {
    logger.error("failed to delete equipment = ", req.params.equipment_id);
    res.status(config.INTERNAL_SERVER_ERROR).json(equipment_data);
    logger.trace("Delete equipment successfully = ", req.params.equipment_id);
    res.status(config.OK_STATUS).json(equipment_data);
  }
});

/**
 * @api {get} /admin/equipment/undo/:equipment_id Undo
 * @apiName Undo
 * @apiGroup Equipment
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/undo/:equipment_id", async (req, res) => {
  logger.trace("Undo equipment API - Id = ", req.params.equipment_id);

  let equipment_data = await equipment_helper.delete_equipment_by_id({
    _id: mongoose.Types.ObjectId(req.params.equipment_id)
  }, {
      isDeleted: 0
    });

  if (equipment_data.status == 0) {
    logger.error("Undo equipment failed ", req.params.equipment_id);
    res.status(config.OK_STATUS).json(equipment_data);
  } else {
    equipment_data.message = "Equipment recoved"
    logger.trace("Undo equipment successfully ", req.params.equipment_id);
    res.status(config.INTERNAL_SERVER_ERROR).json(equipment_data);
  }
});

module.exports = router;