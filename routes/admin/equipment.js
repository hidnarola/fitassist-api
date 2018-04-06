var express = require("express");
var fs = require("fs");
var path = require("path");


var router = express.Router();

var config = require("../../config");
var logger = config.logger;

var equipment_helper = require("../../helpers/equipment_helper");

/**
 * @api {get} /admin/equipment Get all
 * @apiName Get all
 * @apiGroup Equipment
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
 * @api {get} /admin/equipment/equipment_id Get by ID
 * @apiName Get equipment by ID
 * @apiGroup Equipment
 *
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * * @apiParam {String} equipment_id ID of equipment

 * @apiSuccess (Success 200) {Object} equipment Object of equipment document
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
 * @api {post} /admin/equipment Add
 * @apiName  Add
 * @apiGroup Equipment
 *
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} category_id Equipment's Category id
 * @apiParam {String} name Name of Equipment Equipment
 * @apiParam {Boolean} status status of Equipment
 * @apiParam {String} [description] Description of Equipment
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
        },
        "status": {
            notEmpty: true,
            errorMessage: "Status is required"
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
            "category_id":req.body.category_id,
            "status":req.body.status
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
        if(filename)
        {
            equipment_obj.image='uploads/equipment/' + filename;
        }
        
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
 * @api {put} /admin/equipment/:equipment_id Update
 * @apiName Update
 * @apiGroup Equipment
 *
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 *
 * @apiParam {String} name Name of equipment Equipment
 * @apiParam {String} [description] Description of equipment
 * @apiParam {file} [equipment_img] Equipment image
 * @apiParam {String} category_id Equipment's Category id
 * @apiParam {Boolean} status Status for equipment
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
        },
        "status": {
            notEmpty: true,
            errorMessage: "Status is required"
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
            "category_id":req.body.category_id,
            "status":req.body.status
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
            var resp_data = await equipment_helper.get_equipment_id(req.params.equipment_id);
            console.log(resp_data);
            fs.unlink(resp_data.equipment.image,function(err,Success){
                if(err) throw err;
                console.log('image is deleted');
            });
            equipment_obj.image='uploads/equipment/' + filename;
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
 * @api {delete} /admin/equipment/:equipment_id Delete
 * @apiName Delete
 * @apiGroup Equipment
 *
 * @apiHeader {String}  x-access-token Admin's unique access-key
 *
 * @apiSuccess (Success 200) {String} Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:equipment_id", async (req, res) => {
  logger.trace("Delete equipment API - Id = ", req.query.id);
  var resp_data = await equipment_helper.get_equipment_id(req.params.equipment_id);
  
  let equipment_data = await equipment_helper.delete_equipment_by_id(
    req.params.equipment_id
  );

  if (equipment_data.status === 0) {
    
    res.status(config.INTERNAL_SERVER_ERROR).json(equipment_data);
  } else {
    fs.unlink(resp_data.equipment.image,function(){
        console.log('image is deleted');
    });
    res.status(config.OK_STATUS).json(equipment_data);
  }
});

module.exports = router;
