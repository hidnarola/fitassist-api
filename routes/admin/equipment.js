var express = require("express");
var fs = require("fs");
var path = require("path");


var router = express.Router();

var config = require("../../config");
var logger = config.logger;

var equipment_helper = require("../../helpers/equipment_helper");

/**
 * @api {get} /admin/equipment Equipment - Get all
 * @apiName Equipment - Get all
 * @apiGroup Admin
 *
 * @apiHeader {String}  x-access-token Admin's unique access-key
 *
 * @apiSuccess (Success 200) {Array} equipments Array of equipments document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
    logger.trace("Get all equipment API called");
    var resp_data = await equipment_helper.get_all_equipment();
    if (resp_data.status == 0) {
      logger.error("Error occured while fetching equipment = ", resp_data);
      res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    } else {
      logger.trace("Equipments got successfully = ", resp_data);
      res.status(config.OK_STATUS).json(resp_data);
    }
  });

  /**
 * @api {get} /admin/equipment/equipment_id Equipment - Get by ID
 * @apiName Equipment - Get equipment by ID
 * @apiGroup Admin
 *
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * * @apiParam {String} equipment_id ID of equipment

 * @apiSuccess (Success 200) {Array} equipments Array of equipment document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:equipment_id", async (req, res) => {
  equipment_id = req.params.equipment_id;
  logger.trace("Get all equipment API called");
  var resp_data = await equipment_helper.get_equipment_id(equipment_id);
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching equipment = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("Equipments got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /admin/equipment Equipment Add
 * @apiName Equipment Equipment Add
 * @apiGroup Admin
 *
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 *
 * @apiParam {String} name Name of equipment Equipment
 * @apiParam {String} [description] Description of equipment
 * @apiParam {file} [equipment_img] Equipment image
 *
 * @apiSuccess (Success 200) {JSON} equipment Equipment details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
    var schema = {
        "name": {
            notEmpty: true,
            errorMessage: "Name is required"
        },
        "description": {
            notEmpty: true,
            errorMessage: "Description is required"
        },
        "category_id": {
            notEmpty: true,
            errorMessage: "Category is required"
        }
    };
    
    req.checkBody(schema);
    var errors = req.validationErrors();
    if (!errors) {
        //console.log("Data = ",req.body);
        //console.log("Files = ",req.files);
        var equipment_obj = {
            "name": req.body.name,
            "description": (req.body.description) ? req.body.description : null,
            "category_id":req.body.category_id
        };

        //image upload
        var filename;
        if (req.files && req.files['equipment_img']) {
            var file = req.files['equipment_img'];
            var dir = "./uploads/equipment";
            var mimetype = ['image/png', 'image/jpeg', 'image/jpg'];

            if (mimetype.indexOf(file.mimetype) != -1) {
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                extention = path.extname(file.name);
                filename = "equipment_" + new Date().getTime() + extention;
                file.mv(dir + '/' + filename, function (err) {
                    if (err) {
                        logger.error("There was an issue in uploading image");
                        res.send({"status": config.MEDIA_ERROR_STATUS, "err": "There was an issue in uploading image"});
                    } else {
                        logger.trace("image has been uploaded. Image name = ", filename);
                        //return res.send(200, "null");
                    }
                });
            } else {
                logger.error("Image format is invalid");
                res.send({"status": config.VALIDATION_FAILURE_STATUS, "err": "Image format is invalid"});
            }
        } else {
            logger.info("Image not available to upload. Executing next instruction");
            //res.send(config.MEDIA_ERROR_STATUS, "No image submitted");
        }
        equipment_obj.image='upload/equipment/' + filename;
        
        //End image upload
        
        let equipment_data = await equipment_helper.insert_equipment(equipment_obj);
        if (equipment_data.status === 0) {
            logger.error("Error while inserting equipment = ", equipment_data);
            res.status(config.BAD_REQUEST).json({ equipment_data });
        } else {
            res.status(config.OK_STATUS).json(equipment_data);
        }
    } else {
        logger.error("Validation Error = ", errors);
        res.status(config.BAD_REQUEST).json({ message: errors });
    }
});

/**
 * @api {put} /admin/equipment/:equipment_id Equipment Update
 * @apiName Equipment Update
 * @apiGroup Admin
 *
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 *
 * @apiParam {String} name Name of equipment Equipment
 * @apiParam {String} [description] Description of equipment
 * @apiParam {file} [equipment_img] Equipment image
 * @apiParam {String} category_id Equipment's Category id
 * @apiSuccess (Success 200) {JSON} equipment Equipment details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:equipment_id", async (req, res) => {
    
    var schema = {
        "name": {
            notEmpty: true,
            errorMessage: "Name is required"
        },
        "description": {
            notEmpty: true,
            errorMessage: "Description is required"
        },
        "category_id": {
            notEmpty: true,
            errorMessage: "Category is required"
        }
    };

    // Coming in few minutes
    // ok

    req.checkBody(schema);
    var errors = req.validationErrors();
    if (!errors) {
        var equipment_obj = {
            "name": req.body.name,
            "description": (req.body.description) ? req.body.description : null,
            "category_id":req.body.category_id
        };

// Image upload
        var filename;
        if (req.files && req.files['equipment_img']) {
            var file = req.files['equipment_img'];
            var dir = "./uploads/equipment";
            var mimetype = ['image/png', 'image/jpeg', 'image/jpg'];

            if (mimetype.indexOf(file.mimetype) != -1) {
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                extention = path.extname(file.name);
                filename = "equipment_" + new Date().getTime() + extention;
                file.mv(dir + '/' + filename, function (err) {
                    if (err) {
                        logger.error("There was an issue in uploading image");
                        res.send({"status": config.MEDIA_ERROR_STATUS, "err": "There was an issue in uploading image"});
                    } else {
                        logger.trace("image has been uploaded. Image name = ", filename);
                        //return res.send(200, "null");
                    }
                });
            } else {
                logger.error("Image format is invalid");
                res.send({"status": config.VALIDATION_FAILURE_STATUS, "err": "Image format is invalid"});
            }
        } else {
            logger.info("Image not available to upload. Executing next instruction");
            //res.send(config.MEDIA_ERROR_STATUS, "No image submitted");
        }
       
        //End image upload
        if(filename)
        {
            equipment_obj.image='upload/equipment/' + filename;
        }

        console.log(equipment_obj);
        let equipment_data = await equipment_helper.update_equipment_by_id(req.params.equipment_id, equipment_obj);
        if (equipment_data.status === 0) {
            logger.error("Error while updating equipment = ", equipment_data);
            res.status(config.BAD_REQUEST).json({ equipment_data });
        } else {
            res.status(config.OK_STATUS).json(equipment_data);
        }
    } else {
        logger.error("Validation Error = ", errors);
        res.status(config.BAD_REQUEST).json({ message: errors });
    }

});

/**
 * @api {delete} /admin/equipment/:equipment_id Equipment Delete
 * @apiName Equipment Delete
 * @apiGroup Admin
 *
 * @apiHeader {String}  x-access-token Admin's unique access-key
 *
 * @apiSuccess (Success 200) {String} Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:equipment_id", async (req, res) => {
  logger.trace("Delete equipment API - Id = ", req.query.id);
  let equipment_data = await equipment_helper.delete_equipment_by_id(
    req.params.equipment_id
  );

  if (equipment_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(equipment_data);
  } else {
    res.status(config.OK_STATUS).json(equipment_data);
  }
});

module.exports = router;
