var express = require("express");
var router = express.Router();
var config = require("../../config");
var logger = config.logger;
var measurement_helper = require("../../helpers/measurement_helper");
var common_helper = require("../../helpers/common_helper");

/**
 * @apiIgnore "not used"
 * @api {post} /admin/measurement/filter Filter
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
}</code></pre>
 * @apiGroup Measurement
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {Object} columnFilter columnFilter Object for filter data
 * @apiParam {Object} columnSort columnSort Object for Sorting Data
 * @apiParam {Object} columnFilterEqual columnFilterEqual Object for select box
 * @apiParam {Number} pageSize pageSize
 * @apiParam {Number} page page number
 * @apiSuccess (Success 200) {JSON} filtered_measurements filtered details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/filter", async (req, res) => {
  filter_object = common_helper.changeObject(req.body);
  let filtered_data = await measurement_helper.get_filtered_records(
    filter_object
  );
  if (filtered_data.status === 0) {
    logger.error("Error while fetching searched data = ", filtered_data);
    return res.status(config.INTERNAL_SERVER_ERROR).json({
      filtered_data
    });
  } else {
    return res.status(config.OK_STATUS).json(filtered_data);
  }
});

/**
 * @apiIgnore "not used"
 * @api {get} /admin/measurement Get all
 * @apiName Get all
 * @apiGroup Measurement
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} measurements Array of body_measurement document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  logger.trace("Get all measurement API called");
  var resp_data = await measurement_helper.get_all_measurement();
  if (resp_data.status == 0) {
    logger.error("Error occured while fetching measurement = ", resp_data);
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("Measurement got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @apiIgnore "not used"
 * @api {get} /admin/measurement/:measurement_by_id Get by ID
 * @apiName Get by ID
 * @apiGroup Measurement
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} measurement Array of body_measurement document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/:measurement_by_id", async (req, res) => {
  measurement_by_id = req.params.measurement_by_id;
  logger.trace("Get all measurement API called");
  var resp_data = await measurement_helper.get_body_measurement_id({
    _id: measurement_by_id
  });
  if (resp_data.status == 0) {
    logger.error(
      "Error occured while fetching get_body_measurement_by_id = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("body_measurement got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @apiIgnore "not used"
 * @api {get} /admin/measurement/userid/:user_id Get by User ID
 * @apiName Get by User ID
 * @apiGroup Measurement
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} measurements Array of body_measurement document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/userid/:user_id", async (req, res) => {
  user_id = req.params.user_id;
  logger.trace("Get all measurement API called");
  var resp_data = await measurement_helper.get_body_measurement_by_userid({
    userId: user_id
  });
  if (resp_data.status == 0) {
    logger.error(
      "Error occured while fetching get_body_measurement_by_userid = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("body_measurement got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @apiIgnore "not used"
 * @api {post} /admin/measurement Add
 * @apiName Add
 * @apiGroup Measurement
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {Date} logDate logDate of bodymesurement
 * @apiParam {Number} [neck] neck of bodymesurement
 * @apiParam {Number} [shoulder] shoulder of bodymesurement
 * @apiParam {Number} [chest] chest of bodymesurement
 * @apiParam {Number} [upperArm] upperArm of bodymesurement
 * @apiParam {Number} [waist] waist of bodymesurement
 * @apiParam {Number} [forearm] forearm of bodymesurement
 * @apiParam {Number} [hips] hips of bodymesurement
 * @apiParam {Number} [thigh] thigh of bodymesurement
 * @apiParam {Number} [calf] calf of bodymesurement
 * @apiParam {Number} [weight] weight of bodymesurement
 * @apiParam {Number} [height] height of bodymesurement
 * @apiSuccess (Success 200) {JSON} measurement Measurement details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/", async (req, res) => {
  var schema = {
    logDate: {
      notEmpty: true,
      errorMessage: "Log Date is required"
    },
    userId: {
      notEmpty: true,
      errorMessage: "userId is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var measurement_obj = {
      userId: req.body.userId,
      logDate: req.body.logDate ? req.body.logDate : 0,
      neck: req.body.neck ? req.body.neck : 0,
      shoulders: req.body.shoulders ? req.body.shoulders : 0,
      chest: req.body.chest ? req.body.chest : 0,
      upperArm: req.body.upperArm ? req.body.upperArm : 0,
      waist: req.body.waist ? req.body.waist : 0,
      forearm: req.body.forearm ? req.body.forearm : 0,
      hips: req.body.hips ? req.body.hips : 0,
      thigh: req.body.thigh ? req.body.thigh : 0,
      calf: req.body.calf ? req.body.calf : 0,
      weight: req.body.weight ? req.body.weight : 0,
      height: req.body.height ? req.body.height : 0
    };

    let measurement_data = await measurement_helper.insert_body_measurement(
      measurement_obj
    );
    if (measurement_data.status === 0) {
      logger.error(
        "Error while inserting measurement data = ",
        measurement_data
      );
      return res.status(config.BAD_REQUEST).json({
        measurement_data
      });
    } else {
      return res.status(config.OK_STATUS).json(measurement_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

/**
 * @apiIgnore "not used"
 * @api {put} /admin/measurement/:measurement_id Update
 * @apiName Update
 * @apiGroup Measurement
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiParam {Date} logDate logDate of bodymesurement
 * @apiParam {Number} [neck] neck of bodymesurement
 * @apiParam {Number} [shoulder] shoulder of bodymesurement
 * @apiParam {Number} [chest] chest of bodymesurement
 * @apiParam {Number} [upperArm] upperArm of bodymesurement
 * @apiParam {Number} [waist] waist of bodymesurement
 * @apiParam {Number} [forearm] forearm of bodymesurement
 * @apiParam {Number} [hips] hips of bodymesurement
 * @apiParam {Number} [thigh] thigh of bodymesurement
 * @apiParam {Number} [calf] calf of bodymesurement
 * @apiParam {Number} [weight] weight of bodymesurement
 * @apiParam {Number} [height] height of bodymesurement
 * @apiSuccess (Success 200) {Array}  measurement of body_measurement document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.put("/:measurement_id", async (req, res) => {
  var schema = {
    logDate: {
      notEmpty: true,
      errorMessage: "Log Date is required"
    },
    userId: {
      notEmpty: true,
      errorMessage: "userId is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();

  if (!errors) {
    var measurement_obj = {
      userId: req.body.userId,
      logDate: req.body.logDate ? req.body.logDate : 0,
      neck: req.body.neck ? req.body.neck : 0,
      shoulders: req.body.shoulders ? req.body.shoulders : 0,
      chest: req.body.chest ? req.body.chest : 0,
      upperArm: req.body.upperArm ? req.body.upperArm : 0,
      waist: req.body.waist ? req.body.waist : 0,
      forearm: req.body.forearm ? req.body.forearm : 0,
      hips: req.body.hips ? req.body.hips : 0,
      thigh: req.body.thigh ? req.body.thigh : 0,
      calf: req.body.calf ? req.body.calf : 0,
      weight: req.body.weight ? req.body.weight : 0,
      height: req.body.height ? req.body.height : 0,
      modifiedAt: new Date()
    };

    let measurement_data = await measurement_helper.update_body_measurement(
      req.params.measurement_id,
      measurement_obj
    );
    if (measurement_data.status === 0) {
      logger.error(
        "Error while updating measurement data = ",
        measurement_data
      );
      return res.status(config.BAD_REQUEST).json({
        measurement_data
      });
    } else {
      return res.status(config.OK_STATUS).json(measurement_data);
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.VALIDATION_FAILURE_STATUS).json({
      message: errors
    });
  }
});

/**
 * @apiIgnore "not used"
 * @api {delete} /admin/measurement/:measurement_id Delete
 * @apiName Delete
 * @apiGroup Measurement
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:measurement_id", async (req, res) => {
  logger.trace("Delete Measurement API - Id = ", req.params.measurement_id);
  let measurement_data = await measurement_helper.delete_measurement_by_id(
    req.params.measurement_id
  );

  if (measurement_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(measurement_data);
  } else {
    res.status(config.OK_STATUS).json(measurement_data);
  }
});

module.exports = router;