var express = require("express");
var router = express.Router();
var fs = require("fs");
var path = require("path");
var config = require("../../config");
var jwtDecode = require("jwt-decode");
var logger = config.logger;
var user_progress_photos_helper = require("../../helpers/user_progress_photos_helper");
var user_timeline_helper = require("../../helpers/user_timeline_helper");

/**
 * @api {get} /user/progress_photo/username/latest_month_wise/:limit? Get all Latest
 * @apiName Get all Latest
 * @apiGroup User Progress Photo
 * @apiDescription  limit is use to limit the records. default is : 10
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {Array} user_progress_photos Array of user's progress_photos 's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/latest_month_wise/:username/:limit?", async (req, res) => {
    var limit = parseInt(req.params.limit ? req.params.limit : 10);
    logger.trace("Get all user's progress_photo API called");
    var resp_data = await user_progress_photos_helper.get_user_progress_photos_month_wise({
        username: req.params.username
    }, {
        $limit: limit
    });
    if (resp_data.status == 0) {
        logger.error(
                "Error occured while fetching get all user progress photos = ",
                resp_data
                );
        res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    } else {
        logger.trace("user progress photos got successfully = ", resp_data);
        res.status(config.OK_STATUS).json(resp_data);
    }
});

/**
 * @api {get} /user/progress_photo/:username/:start?/:limit?:/:sort_by Get all
 * @apiName Get all
 * @apiGroup User Progress Photo
 * @apiDescription  username: user's username, start use for skip record. default is 0, limit is use to limit the records. default is : 10
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {Array} user_progress_photos Array of user's progress_photos 's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:username/:start?/:limit?/:sort_by", async (req, res) => {
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;

    var start = parseInt(req.params.start ? req.params.start : 0);
    var limit = parseInt(req.params.limit ? req.params.limit : 10);
    var sort_by = parseInt(req.params.sort_by ? req.params.sort_by : -1);

    logger.trace("Get all user's progress_photo API called");
    var resp_data = await user_progress_photos_helper.get_user_progress_photos({
        username: req.params.username,
        isDeleted: 0
    }, {
        $skip: start
    }, {
        $limit: limit
    }, {
        $sort: {
            date: sort_by
        }
    });
    if (resp_data.status === 1) {
        resp_data.total_records = 0;
        var count = await user_progress_photos_helper.count_all_progress_photo({
            userId: authUserId,
            isDeleted: 0
        });
        if (count.status === 1) {
            resp_data.total_records = count.count;
        }
        logger.trace("user progress photos got successfully = ", resp_data);
        res.status(config.OK_STATUS).json(resp_data);
    } else {
        logger.error(
                "Error occured while fetching get all user progress photos = ",
                resp_data
                );
        res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    }
});

/**
 * @api {get} /user/progress_photo/:user_photo_id Get by ID
 * @apiName Get by ID
 * @apiGroup User Progress Photo
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {Array} user_progress_photo progress_photo's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:user_photo_id", async (req, res) => {
    logger.trace(
            "Get user progress photo by ID API called : ",
            req.params.user_photo_id
            );
    var resp_data = await user_progress_photos_helper.get_user_progress_photo_by_id({
        _id: req.params.user_photo_id,
        isDeleted: 0
    });
    if (resp_data.status == 0) {
        logger.error(
                "Error occured while fetching user progress photo = ",
                resp_data
                );
        res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    } else {
        logger.trace("user progress photo got successfully = ", resp_data);
        res.status(config.OK_STATUS).json(resp_data);
    }
});

/**
 * @api {post} /user/progress_photo Add
 * @apiName Add
 * @apiGroup User Progress Photo
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization user's unique access-key
 * @apiParam {File} image User's Progress Image
 * @apiParam {String} description Description of progress
 * @apiParam {Date} date date of progress photo
 * @apiSuccess (Success 200) {JSON} user_progress_photo user_progress_photo details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;

    var user_progress_photo_obj = {
        userId: authUserId,
        date: req.body.date
    };

    if (req.body.description) {
        user_progress_photo_obj.description = req.body.description;
    }

    //image upload
    var filename = [];
    if (req.files && req.files["image"]) {
        var files = req.files["image"].constructor === Array ? req.files["image"] : [req.files["image"]];
        var dir = "./uploads/user_progress";
        var mimetype = ["image/png", "image/jpeg", "image/jpg"];
        let validImageCount = 0;
        let validImageUpload = 0;
        for (let file of files) {
            if (mimetype.indexOf(file.mimetype) != -1) {
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                extention = path.extname(file.name);
                _filename = "user_progress_" + new Date().getTime() + extention;
                await file.mv(dir + "/" + _filename, function (err) {
                    if (err) {
                        logger.error("There was an issue in uploading image");
                    } else {
                        logger.trace("image has been uploaded. Image name = ", _filename);
                        filename.push(_filename);
                        validImageUpload++;
                    }
                });
                validImageCount++;
            }
        }
        if (validImageUpload <= 0) {
            res.send({status: config.MEDIA_ERROR_STATUS, err: "There was an issue in uploading image"});
        } else if (validImageCount <= 0) {
            logger.error("Image format is invalid");
            res.send({status: config.VALIDATION_FAILURE_STATUS, err: "Image format is invalid"});
        }
    } else {
        logger.info("Image not available to upload. Executing next instruction");
        res.send(config.MEDIA_ERROR_STATUS, "No image submitted");
    }
    console.log('filename => ', filename);
    if (filename && filename.length > 0) {
        for (let f of filename) {
            user_progress_photo_obj.image = "uploads/user_progress/" + f;
            let user_progress_photo_data = await user_progress_photos_helper.insert_user_progress_photo(user_progress_photo_obj);
            //TIMELINE START
            var timelineObj = {
                userId: authUserId,
                createdBy: authUserId,
                progressPhotoId: user_progress_photo_data.user_progress_photo._id,
                tagLine: "added a new progress photo",
                type: "progress_photo",
                privacy: req.body.privacy ? req.body.privacy : 3
            };

            let user_timeline_data = await user_timeline_helper.insert_timeline_data(timelineObj);

            if (user_timeline_data.status === 0) {
                logger.error("Error while inserting timeline data = ", user_timeline_data);
            } else {
                logger.error("successfully added timeline data = ", user_timeline_data);
            }
        }
        //TIMELINE END
        res.status(config.OK_STATUS).json(user_progress_photo_data);
    }
});

/**
 * @api {delete} /user/progress_photo/:photo_id Delete
 * @apiName Delete
 * @apiGroup User Progress Photo
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:photo_id", async (req, res) => {
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;
    logger.trace("Delete user's progress photo API - Id = ", req.params.photo_id);
    let nutrition_predata_data = await user_progress_photos_helper.delete_user_progress_photo({
        userId: authUserId,
        _id: req.params.photo_id
    }, {
        isDeleted: 1
    });

    if (nutrition_predata_data.status === 0) {
        res.status(config.INTERNAL_SERVER_ERROR).json(nutrition_predata_data);
    } else {
        res.status(config.OK_STATUS).json(nutrition_predata_data);
    }
});

module.exports = router;