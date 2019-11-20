var express = require("express");
var router = express.Router();
var fs = require("fs");
var path = require("path");
var config = require("../../config");
var jwtDecode = require("jwt-decode");
var logger = config.logger;
var user_progress_photos_helper = require("../../helpers/user_progress_photos_helper");
var user_helper = require("../../helpers/user_helper");
var user_timeline_helper = require("../../helpers/user_timeline_helper");
const base64Img = require("base64-img");
const constant = require("../../constant");
const moment = require("moment");

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
  var resp_data = await user_progress_photos_helper.get_user_progress_photos_month_wise(
    {
      username: req.params.username
    },
    {
      $limit: limit
    }
  );
  if (resp_data.status === 0) {
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
  var resp_data = await user_progress_photos_helper.get_user_progress_photos(
    {
      username: req.params.username
    },
    {
      $skip: start
    },
    {
      $limit: limit
    },
    {
      $sort: {
        date: sort_by
      }
    }
  );
  if (resp_data.status === 1) {
    var user = await user_helper.get_user_by({
      username: req.params.username
    });
    if (user && user.user && user.user.authUserId) {
      resp_data.total_records = await user_progress_photos_helper.countTotalUsersProgresPhotos(
        user.user.authUserId
      );
      logger.trace("user progress photos got successfully = ", resp_data);
      res.status(config.OK_STATUS).json(resp_data);
    } else {
      logger.error(
        "Error occured while fetching get all user progress photos = ",
        resp_data
      );
      res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    }
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
  var resp_data = await user_progress_photos_helper.get_user_progress_photo_by_id(
    {
      _id: req.params.user_photo_id
    }
  );
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
      description:
        typeof req.body.description !== "undefined" ? req.body.description : "",
      date: req.body.date
    };

    let userProgressRes = await user_progress_photos_helper.insert_user_progress(
      userProgress
    );
    if (userProgressRes.status === 1) {
      let userProgress = userProgressRes.user_progress_photo;
      let userProgressId = userProgress._id;
      let dir = "./uploads/user_progress";
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      let progressPhotosData = [req.body.progressPhotosData];
      let progressPhotosDataArr = [];
      let filepathArr = [];
      for (let pPD of progressPhotosData) {
        pPD.images.forEach(item => {
          let filename = "user_progress_" + new Date().getTime();
          let filepath = base64Img.imgSync(item, dir, filename);
          filepath = filepath.replace(/\\/g, "/");
          filepathArr.push({ image: filepath });
        });
        let obj = {
          userId: authUserId,
          progressId: userProgressId,
          category: pPD.category ? pPD.category : null,
          caption: pPD.caption ? pPD.caption : null,
          image: filepathArr,
          hashTags: pPD.tags ? pPD.tags : null,
          visibility: req.body.visibility ? req.body.visibility : 3
        };
        switch (pPD.category) {
          case constant.PROGRESS_PHOTO_CATEGORY.basic:
            obj["basic"] = pPD.subCategory ? pPD.subCategory : null;
            break;
          case constant.PROGRESS_PHOTO_CATEGORY.isolation:
            obj["isolation"] = pPD.subCategory ? pPD.subCategory : null;
            break;
          case constant.PROGRESS_PHOTO_CATEGORY.posed:
            obj["posed"] = pPD.subCategory ? pPD.subCategory : null;
            break;
        }
        progressPhotosDataArr.push(obj);
      }
      console.log("===========progressPhotosDataArr===========");
      console.log(progressPhotosDataArr);
      console.log("==========================");

      let userProgressPhotosRes = await user_progress_photos_helper.insert_user_progress_photo(
        progressPhotosDataArr
      );
      if (userProgressPhotosRes.status === 1) {
        var timelineObj = {
          userId: authUserId,
          createdBy: authUserId,
          progressPhotoId: userProgressId,
          tagLine: "added new progress photos",
          type: "progress_photo",
          privacy: req.body.visibility ? req.body.visibility : 3
        };
        let user_timeline_data = await user_timeline_helper.insert_timeline_data(
          timelineObj
        );
        if (user_timeline_data.status === 0) {
          logger.error(
            "Error while inserting timeline data = ",
            user_timeline_data
          );
        } else {
          logger.error(
            "successfully added timeline data = ",
            user_timeline_data
          );
        }
        let responseData = {
          status: 1,
          message: "Progress saved",
          data: userProgressRes
        };
        res.status(config.OK_STATUS).json(responseData);
      } else {
        await user_progress_photos_helper.deleteUserProgressById(
          userProgressId
        );
        let responseData = {
          status: 0,
          message: "Something went wrong while saving progress data",
          error: null
        };
        console.log("===========DELETE ERROR===========");
        console.log("DELETE ERROR", responseData);
        console.log("==========================");
        res.status(config.INTERNAL_SERVER_ERROR).json(responseData);
      }
    } else {
      let responseData = {
        status: 0,
        message: "Something went wrong while saving progress data",
        error: null
      };
      console.log("===========responseData 1===========");
      console.log("responseData", responseData);
      console.log("==========================");
      res.status(config.INTERNAL_SERVER_ERROR).json(responseData);
    }
  } catch (error) {
    let responseData = {
      status: 0,
      message: "Something went wrong while saving progress data",
      error: error
    };
    console.log("===========responseData 2===========");
    console.log("responseData", responseData);
    console.log("==========================");
    res.status(config.INTERNAL_SERVER_ERROR).json(responseData);
  }
});

// router.post("/", async (req, res) => {
//   try {
//     var decoded = jwtDecode(req.headers["authorization"]);
//     var authUserId = decoded.sub;

//     let userProgress = {
//       userId: authUserId,
//       description:
//         typeof req.body.description !== "undefined" ? req.body.description : "",
//       date: req.body.date
//     };

//     let userProgressRes = await user_progress_photos_helper.insert_user_progress(
//       userProgress
//     );
//     if (userProgressRes.status === 1) {
//       let userProgress = userProgressRes.user_progress_photo;
//       let userProgressId = userProgress._id;
//       let dir = "./uploads/user_progress";
//       if (!fs.existsSync(dir)) {
//         fs.mkdirSync(dir);
//       }
//       let progressPhotosData = req.body.progressPhotosData;
//       let progressPhotosDataArr = [];
//       for (let pPD of progressPhotosData) {
//         let imgData = pPD.image;
//         let filename = "user_progress_" + new Date().getTime();
//         let filepath = base64Img.imgSync(imgData, dir, filename);
//         filepath = filepath.replace(/\\/g, "/");
//         let obj = {
//           userId: authUserId,
//           progressId: userProgressId,
//           category: pPD.category ? pPD.category : null,
//           caption: pPD.caption ? pPD.caption : null,
//           image: filepath
//         };
//         switch (pPD.category) {
//           case constant.PROGRESS_PHOTO_CATEGORY.basic:
//             obj["basic"] = pPD.subCategory ? pPD.subCategory : null;
//             break;
//           case constant.PROGRESS_PHOTO_CATEGORY.isolation:
//             obj["isolation"] = pPD.subCategory ? pPD.subCategory : null;
//             break;
//           case constant.PROGRESS_PHOTO_CATEGORY.posed:
//             obj["posed"] = pPD.subCategory ? pPD.subCategory : null;
//             break;
//         }
//         progressPhotosDataArr.push(obj);
//       }
//       let userProgressPhotosRes = await user_progress_photos_helper.insert_user_progress_photo(
//         progressPhotosDataArr
//       );
//       if (userProgressPhotosRes.status === 1) {
//         var timelineObj = {
//           userId: authUserId,
//           createdBy: authUserId,
//           progressPhotoId: userProgressId,
//           tagLine: "added new progress photos",
//           type: "progress_photo",
//           privacy: req.body.privacy ? req.body.privacy : 3
//         };
//         let user_timeline_data = await user_timeline_helper.insert_timeline_data(
//           timelineObj
//         );
//         if (user_timeline_data.status === 0) {
//           logger.error(
//             "Error while inserting timeline data = ",
//             user_timeline_data
//           );
//         } else {
//           logger.error(
//             "successfully added timeline data = ",
//             user_timeline_data
//           );
//         }
//         let responseData = {
//           status: 1,
//           message: "Progress saved",
//           data: userProgressRes
//         };
//         res.status(config.OK_STATUS).json(responseData);
//       } else {
//         await user_progress_photos_helper.deleteUserProgressById(
//           userProgressId
//         );
//         let responseData = {
//           status: 0,
//           message: "Something went wrong while saving progress data",
//           error: null
//         };
//         res.status(config.INTERNAL_SERVER_ERROR).json(responseData);
//       }
//     } else {
//       let responseData = {
//         status: 0,
//         message: "Something went wrong while saving progress data",
//         error: null
//       };
//       res.status(config.INTERNAL_SERVER_ERROR).json(responseData);
//     }
//   } catch (error) {
//     let responseData = {
//       status: 0,
//       message: "Something went wrong while saving progress data",
//       error: error
//     };
//     res.status(config.INTERNAL_SERVER_ERROR).json(responseData);
//   }
// });

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
  let nutrition_predata_data = await user_progress_photos_helper.delete_user_progress_photo(
    { userId: authUserId, _id: req.params.photo_id }
  );
  if (nutrition_predata_data.status === 1) {
    res.status(config.OK_STATUS).json(nutrition_predata_data);
  } else {
    res.status(config.INTERNAL_SERVER_ERROR).json(nutrition_predata_data);
  }
});

/**
 * @api {post} /user/progress_photo/get_by_date Add
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
router.post("/get_by_date", async (req, res) => {
  try {
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;
    let logDate = req.body.logDate ? req.body.logDate : new Date();

    var startdate = moment(logDate).utcOffset(0);
    startdate.toISOString();
    startdate.format();

    var enddate = moment(logDate)
      .utcOffset(0)
      .add(23, "hours")
      .add(59, "minutes");
    enddate.toISOString();
    enddate.format();

    let cond = {
      userId: authUserId,
      date: {
        $gte: new Date(startdate),
        $lte: new Date(enddate)
      }
    };
    let userProgress = await user_progress_photos_helper.getUserProgressByDate(
      cond
    );
    res.status(config.OK_STATUS).json(userProgress);
  } catch (error) {
    let responseData = {
      status: 0,
      message: "Something went wrong while saving progress data",
      error: error
    };
    res.status(config.INTERNAL_SERVER_ERROR).json(responseData);
  }
});

router.post("/recent_hashtags", async (req, res) => {
  try {
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;
    var limit = req.body.limit ? req.body.limit : 5;
    var resp_data = await user_progress_photos_helper.get_recent_hashTags(
      limit,
      authUserId
    );
    if (resp_data.status === 1) {
      res.status(config.OK_STATUS).json(resp_data);
    } else {
      res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
    }
  } catch (error) {
    let responseData = {
      status: 0,
      message: "Something went wrong while saving progress data",
      error: error
    };
    res.status(config.INTERNAL_SERVER_ERROR).json(responseData);
  }
});

module.exports = router;
