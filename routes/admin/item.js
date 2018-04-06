var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");

var router = express.Router();

var config = require("../../config");
var logger = config.logger;

var items_helper = require("../../helpers/items_helper");
var common_helper = require("../../helpers/common_helper");




/**
 * @api {post} /admin/item/filter Item Filter
 * @apiName Item Item Filter
 * @apiGroup Item
 * 
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * 
 * @apiParam {Object} columnFilter columnFilter Object for filter data
 * @apiParam {Object} columnSort columnSort Object for Sorting Data
 * @apiParam {Object} columnFilterEqual columnFilterEqual Object for select box
 * @apiParam {Number} pageSize pageSize
 * @apiParam {Number} page page number
 * @apiSuccess (Success 200) {JSON} filtered_items filtered details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/filter", async (req, res) => {
  
    filter_object = common_helper.changeObject(req.body);
    let filtered_data = await items_helper.get_filtered_records(filter_object);
    //console.log(filtered_data);
    if (filtered_data.status === 0) {
      logger.error("Error while fetching searched data = ", filtered_data);
      return res.status(config.BAD_REQUEST).json({ filtered_data });
    } else {
      return res.status(config.OK_STATUS).json(filtered_data);
    }
  });

/**
 * @api {get} /admin/item Items - Get all
 * @apiName Items - Get all
 * @apiGroup Items
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} items Array of items document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {

    logger.trace("Get all Items API called");
    var resp_data = await items_helper.get_all_items();
    if (resp_data.status == 0) {
      logger.error("Error occured while fetching Items = ", resp_data);
      res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    } else {
      logger.trace("Items got successfully = ", resp_data);
      res.status(config.OK_STATUS).json(resp_data);
    }
  });

  
/**
 * @api {get} /admin/item/item_id Items - Get item by ID
 * @apiName Items - Item by ID
 * @apiGroup Items
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} item_id ID of item
 * @apiSuccess (Success 200) {Array} item Array of items document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:item_id", async (req, res) => {
    item_id = req.params.item_id;
  logger.trace("Get item by id API called");
  var resp_data = await items_helper.get_item_by_id(item_id);
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching item = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("item got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});


/**
 * @api {post} /admin/item Items - Add
 * @apiName Items - Add
 * @apiGroup Items
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} name name of item
 * @apiParam {String} [details] details of item
 * @apiParam {File} [item_img] iamge of Item
 * @apiSuccess (Success 200) {Array} item Array of items document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {   
    var schema = {
        'name': {
            notEmpty: true,
            errorMessage: "name of item is required"
        }
    };
    req.checkBody(schema);
    var errors = req.validationErrors();
    
    if (!errors) {
        var item_obj = {
            "name": req.body.name,
            "details": req.body.details,
            };

            //image upload
        var filename;
        if (req.files && req.files['item_img']) {
            var file = req.files['item_img'];
            var dir = "./uploads/item";
            var mimetype = ['image/png', 'image/jpeg', 'image/jpg'];

            if (mimetype.indexOf(file.mimetype) != -1) {
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                extention = path.extname(file.name);
                filename = "item_" + new Date().getTime() + extention;
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
            item_obj.image='uploads/item/' + filename;
        }
        console.log(item_obj);
        
            let item_data = await items_helper.insert_item(item_obj);
            if (item_data.status === 0) {
                logger.error("Error while updating item data = ", item_data);
                return res.status(config.BAD_REQUEST).json({ item_data });
            } else {
                return res.status(config.OK_STATUS).json(item_data);
            }
    } else {
        logger.error("Validation Error = ", errors);
        res.status(config.BAD_REQUEST).json({ message: errors });
    }

});

/**
 * @api {put} /admin/item Items - Update
 * @apiName Items - Update
 * @apiGroup Items
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} name name of item
 * @apiParam {String} [details] details of item
 * @apiParam {File} [item_img] iamge of Item
 * @apiSuccess (Success 200) {Array} item Array of items document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:item_id", async (req, res) => {
    item_id = req.params.item_id;
    var schema = {
        'name': {
            notEmpty: true,
            errorMessage: "name of item is required"
        }
    };
    req.checkBody(schema);
    var errors = req.validationErrors();
    
    if (!errors) {
        var item_obj = {
            "name": req.body.name,
            "details": req.body.details,
            };

            //image upload
        var filename;
        if (req.files && req.files['item_img']) {
            var file = req.files['item_img'];
            var dir = "./uploads/item";
            var mimetype = ['image/png', 'image/jpeg', 'image/jpg'];

            if (mimetype.indexOf(file.mimetype) != -1) {
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                extention = path.extname(file.name);
                filename = "item_" + new Date().getTime() + extention;
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
            item_obj.image='uploads/item/' + filename;  
            resp_data=await items_helper.get_item_by_id(item_id);
            try{
                fs.unlink(resp_data.item.image,function(){
                    console.log("Image deleted");
                   });
            }
            catch(err)
            {

            }
            
        }
        console.log(item_obj);
        
            let item_data = await items_helper.update_item_by_id(item_id,item_obj);
            if (item_data.status === 0) {
                logger.error("Error while updating item data = ", item_data);
                return res.status(config.BAD_REQUEST).json({ item_data });
            } else {
                return res.status(config.OK_STATUS).json(item_data);
            }
    } else {
        logger.error("Validation Error = ", errors);
        res.status(config.BAD_REQUEST).json({ message: errors });
    }

});



/**
 * @api {delete} /admin/item/:item_id Item - Delete
 * @apiName Item - Delete  
 * @apiGroup Item
 * 
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {String} Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:item_id", async (req, res) => {
    
    logger.trace("Delete item API - Id = ", req.query.id);
    var item_obj = 
    {
        "isDelete": 1,            
    };
    let item_data = await items_helper.delete_item_by_id(
        req.params.item_id,item_obj
    );

    if (item_data.status === 0) {
        res.status(config.INTERNAL_SERVER_ERROR).json(item_data);
    } else {
        res.status(config.OK_STATUS).json(item_data);
    }
});

module.exports = router;
