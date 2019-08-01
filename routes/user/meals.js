var express = require("express");
var fs = require("fs");
var path = require("path");
var router = express.Router();
var config = require("../../config");
var logger = config.logger;
var meals_helper = require("../../helpers/meals_helper");
var common_helper = require("../../helpers/common_helper");
var jwtDecode = require("jwt-decode");

//  post meal
router.post("/search", async (req, res) => {
  var re = new RegExp(req.body.name, "i");
  value = {
    $regex: re
  };
  var projectObj = {
    $project: {
      title: 1,
      meals_type: 1,
      meals_visibility: 1,
      ingredientsIncluded: 1,
      userId: 1,
      image: 1
    }
  };
  var searchObj = {
    $match: {
      title: value
    }
  };
  var start = {
    $skip: parseInt(req.body.start ? req.body.start : 0)
  };
  var offset = {
    $limit: parseInt(req.body.offset ? req.body.offset : 10)
  };
  let resp_data = await meals_helper.search_meal(
    projectObj,
    searchObj,
    start,
    offset
  );
  if (resp_data.status == 1) {
    res.status(config.OK_STATUS).json(resp_data);
  } else {
    res.status(config.BAD_REQUEST).json(resp_data);
  }
});

router.post("/search", async (req, res) => {
  var re = new RegExp(req.body.name, "i");
  value = {
    $regex: re
  };
  var projectObj = {
    $project: {
      title: 1,
      meals_type: 1,
      meals_visibility: 1,
      ingredientsIncluded: 1,
      userId: 1,
      image: 1
    }
  };
  var searchObj = {
    $match: {
      title: value
    }
  };
  var start = {
    $skip: parseInt(req.body.start ? req.body.start : 0)
  };
  var offset = {
    $limit: parseInt(req.body.offset ? req.body.offset : 10)
  };
  let resp_data = await meals_helper.search_meal(
    projectObj,
    searchObj,
    start,
    offset
  );
  if (resp_data.status == 1) {
    res.status(config.OK_STATUS).json(resp_data);
  } else {
    res.status(config.BAD_REQUEST).json(resp_data);
  }
});

module.exports = router;
