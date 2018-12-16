var express = require("express");
var router = express.Router();
var fs = require("fs");
var path = require("path");
var config = require("../../config");
var jwtDecode = require("jwt-decode");
var logger = config.logger;
var user_progress_photos_helper = require("../../helpers/user_progress_photos_helper");
var user_timeline_helper = require("../../helpers/user_timeline_helper");
const base64Img = require('base64-img');

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
    if (resp_data.status === 0) {
        logger.error("Error occured while fetching get all user progress photos = ", resp_data);
        res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    } else {
        logger.trace("user progress photos got successfully = ", resp_data);
        res.status(config.OK_STATUS).json(resp_data);
    }
});

/**
 * @api {get} /user/progress_photo/:username/:start?/:limit?:/:sort_by? Get all
 * @apiName Get all
 * @apiGroup User Progress Photo
 * @apiDescription  username: user's username, start use for skip record. default is 0, limit is use to limit the records. default is : 10
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {Array} user_progress_photos Array of user's progress_photos 's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:username/:start?/:limit?/:sort_by?", async (req, res) => {
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;

    var start = parseInt(req.params.start ? req.params.start : 0);
    var limit = parseInt(req.params.limit ? req.params.limit : 10);
    var sort_by = parseInt(req.params.sort_by ? req.params.sort_by : -1);

    logger.trace("Get all user's progress_photo API called");
    var resp_data = await user_progress_photos_helper.get_user_progress_photos({
        username: req.params.username
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
        var count = await user_progress_photos_helper.count_all_progress_photo({userId: authUserId});
        if (count.status === 1) {
            resp_data.total_records = count.count;
        }
        logger.trace("user progress photos got successfully = ", resp_data);
        res.status(config.OK_STATUS).json(resp_data);
    } else {
        logger.error("Error occured while fetching get all user progress photos = ", resp_data);
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
    logger.trace("Get user progress photo by ID API called : ", req.params.user_photo_id);
    var resp_data = await user_progress_photos_helper.get_user_progress_photo_by_id({
        _id: req.params.user_photo_id
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
    try {
        var decoded = jwtDecode(req.headers["authorization"]);
        var authUserId = decoded.sub;

        let userProgress = {
            userId: authUserId,
            description: typeof req.body.description !== 'undefined' ? req.body.description : '',
            date: req.body.date
        };

        let userProgressRes = await user_progress_photos_helper.insert_user_progress(userProgress);
        if (userProgressRes.status === 1) {
            let userProgress = userProgressRes.user_progress_photo;
            let userProgressId = userProgress._id;
            let dir = "./uploads/user_progress";
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            let progressPhotosData = req.body.progressPhotosData;
            let progressPhotosDataArr = [];
            for (let pPD of progressPhotosData) {
                let imgData = pPD.image;
                let filename = "user_progress_" + new Date().getTime();
                let filepath = base64Img.imgSync(imgData, dir, filename);
                filepath = filepath.replace(/\\/g, "/");
                progressPhotosDataArr.push({
                    userId: authUserId,
                    progressId: userProgressId,
                    basic: pPD.basic ? pPD.basic : null,
                    isolation: pPD.isolation ? pPD.isolation : null,
                    posed: pPD.posed ? pPD.posed : null,
                    caption: pPD.caption ? pPD.caption : null,
                    image: filepath
                });
            }
            let userProgressPhotosRes = await user_progress_photos_helper.insert_user_progress_photo(progressPhotosDataArr);
            if (userProgressPhotosRes.status === 1) {
                var timelineObj = {
                    userId: authUserId,
                    createdBy: authUserId,
                    progressPhotoId: userProgressId,
                    tagLine: "added new progress photos",
                    type: "progress_photo",
                    privacy: req.body.privacy ? req.body.privacy : 3
                };
                let user_timeline_data = await user_timeline_helper.insert_timeline_data(timelineObj);
                if (user_timeline_data.status === 0) {
                    logger.error("Error while inserting timeline data = ", user_timeline_data);
                } else {
                    logger.error("successfully added timeline data = ", user_timeline_data);
                }
                let responseData = {status: 1, message: "Progress saved", data: userProgressRes};
                res.status(config.OK_STATUS).json(responseData);
            } else {
                await user_progress_photos_helper.deleteUserProgressById(userProgressId);
                let responseData = {status: 0, message: "Something went wrong while saving progress data", error: null};
                res.status(config.INTERNAL_SERVER_ERROR).json(responseData);
            }
        } else {
            let responseData = {status: 0, message: "Something went wrong while saving progress data", error: null};
            res.status(config.INTERNAL_SERVER_ERROR).json(responseData);
        }
    } catch (error) {
        let responseData = {status: 0, message: "Something went wrong while saving progress data", error: error};
        res.status(config.INTERNAL_SERVER_ERROR).json(responseData);
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
    let nutrition_predata_data = await user_progress_photos_helper.delete_user_progress_photo({userId: authUserId, _id: req.params.photo_id});
    if (nutrition_predata_data.status === 1) {
        res.status(config.OK_STATUS).json(nutrition_predata_data);
    } else {
        res.status(config.INTERNAL_SERVER_ERROR).json(nutrition_predata_data);
    }
});

module.exports = router;