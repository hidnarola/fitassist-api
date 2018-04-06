var express = require("express");
var fs = require("fs");
var path = require("path");
var async = require("async");

var router = express.Router();

var config = require("../../config");
var logger = config.logger;

var user_helper = require("../../helpers/user_helper");
var common_helper = require("../../helpers/common_helper");




/**
 * @api {post} /admin/user/filter User Filter
 * @apiName User User Filter
 * @apiGroup Admin
 * 
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * 
 * @apiParam {Object} columnFilter columnFilter Object for filter data
 * @apiParam {Object} columnSort columnSort Object for Sorting Data
 * @apiParam {Object} columnFilterEqual columnFilterEqual Object for select box
 * @apiParam {Number} pageSize pageSize
 * @apiParam {Number} page page number
 * @apiSuccess (Success 200) {JSON} filtered_users filtered details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/filter", async (req, res) => {
  
    filter_object = common_helper.changeObject(req.body);
    let filtered_data = await user_helper.get_filtered_records(filter_object);
    //console.log(filtered_data);
    if (filtered_data.status === 0) {
      logger.error("Error while fetching searched data = ", filtered_data);
      return res.status(config.BAD_REQUEST).json({ filtered_data });
    } else {
      return res.status(config.OK_STATUS).json(filtered_data);
    }
  });

/**
 * @api {get} /admin/user User - Get all
 * @apiName User - Get all
 * @apiGroup Admin
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} users Array of users document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {

    logger.trace("Get all Users API called");
    var resp_data = await user_helper.get_all_users();
    if (resp_data.status == 0) {
      logger.error("Error occured while fetching Users = ", resp_data);
      res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    } else {
      logger.trace("Users got successfully = ", resp_data);
      res.status(config.OK_STATUS).json(resp_data);
    }
  });

  
/**
 * @api {get} /admin/user/user_id User - Get by ID
 * @apiName User - Users by ID
 * @apiGroup Admin
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} user_id ID of User
 * @apiSuccess (Success 200) {Array} user Array of user document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:user_id", async (req, res) => {
    user_id = req.params.user_id;
  logger.trace("Get user by id API called");
  var resp_data = await user_helper.get_user_by_id(user_id);
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching user = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("user got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});


/**
 * @api {put} /admin/user User - Update
 * @apiName User - Update
 * @apiGroup Admin
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {String} first_name First name of user
 * @apiParam {String} last_name Last name of user
 * @apiParam {String} username Username
 * @apiParam {String} email Email address
 * @apiParam {Number} [mobileNumber] mobileNumber
 * @apiParam {Enum} gender gender | Possible Values ('male', 'female', 'transgender')
 * @apiParam {Date} [dateOfBirth] Date of Birth
 * @apiParam {Array} [goal] goal
 * @apiParam {File} [user_img] avatar
 * @apiParam {String} [aboutMe] aboutMe
 * @apiParam {Array} favRecipes favRecipes
 * @apiParam {Boolean} status status
 * @apiSuccess (Success 200) {Array} user Array of users document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:user_id", async (req, res) => {
    user_id = req.params.user_id;
   
    var schema = {
        'first_name': {
            notEmpty: true,
            errorMessage: "First name is required"
        },
        'last_name': {
            notEmpty: true,
            errorMessage: "Last name is required"
        },
        'username': {
          notEmpty: true,
          errorMessage: "Username is required"
        },
        'email': {
            notEmpty: true,
            errorMessage: "Email address is required",
            isEmail: {errorMessage: "Please enter valid email address"}
        },
        'gender': {
            notEmpty: true,
            isIn: {
              options: [['male', 'female', 'transgender']],
              errorMessage: 'Gender can be from male, female or transgender'
            },
            errorMessage: "Gender is required",
        },
        'goal': {
            notEmpty: true,
            errorMessage: "Goal is required"
        },
        'aboutme': {
            notEmpty: true,
            errorMessage: "About me is required"
        },
        'favRecipes': {
            notEmpty: true,
            errorMessage: "FavRecipes is required"
        },
        'status': {
            notEmpty: true,
            errorMessage: "Status is required"
        }
    };
    req.checkBody(schema);
    var errors = req.validationErrors();
    
    if (!errors) {
        var user_obj = {
            "first_name": req.body.first_name,
            "last_name": req.body.last_name,
            "username": req.body.username,
            "email": req.body.email,
            "mobileNumber": req.body.mobileNumber,
            "gender": req.body.gender,
            "dateOfBirth": req.body.dateOfBirth,
            "goal": JSON.parse(req.body.goal),
            "aboutMe": req.body.aboutme,
            "favRecipes": JSON.parse(req.body.favRecipes),
            "status": req.body.status,            
            };

            //image upload
        var filename;
        if (req.files && req.files['user_img']) {
            var file = req.files['user_img'];
            var dir = "./uploads/user";
            var mimetype = ['image/png', 'image/jpeg', 'image/jpg'];

            if (mimetype.indexOf(file.mimetype) != -1) {
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                extention = path.extname(file.name);
                filename = "user_" + new Date().getTime() + extention;
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
            user_obj.avatar='uploads/user/' + filename;
            resp_data=await user_helper.get_user_by_id(user_id);
            try{
                fs.unlink(resp_data.user.avatar,function(){
                    console.log("Image deleted");
                   });
            }
            catch(err)
            {

            }
        }
        console.log(user_obj);
        
            let user_data = await user_helper.update_user_by_id(user_id,user_obj);
            if (user_data.status === 0) {
                logger.error("Error while updating user data = ", user_data);
                return res.status(config.BAD_REQUEST).json({ user_data });
            } else {
                return res.status(config.OK_STATUS).json(user_data);
            }
    } else {
        logger.error("Validation Error = ", errors);
        res.status(config.BAD_REQUEST).json({ message: errors });
    }

});

/**
 * @api {delete} /admin/user/:user_id User - Delete
 * @apiName User - Delete  
 * @apiGroup Admin
 * 
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {String} Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:user_id", async (req, res) => {
    
    logger.trace("Delete user API - Id = ", req.query.id);
    var user_obj = 
    {
        "isDelete": 1,            
    };
    let userdata = await user_helper.delete_user_by_id(
        req.params.user_id,user_obj
    );

    if (userdata.status === 0) {
        res.status(config.INTERNAL_SERVER_ERROR).json(userdata);
    } else {
        res.status(config.OK_STATUS).json(userdata);
    }
});

module.exports = router;
