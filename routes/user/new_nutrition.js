var express = require("express");
var router = express.Router();
var config = require("../../config");
var user_helper = require("../../helpers/user_helper");
var new_nutrition_helper = require("../../helpers/new_nutrition_helper");
var jwtDecode = require("jwt-decode");
var logger = config.logger;
var autocorrect = require('autocorrect')();

/**
 * @api {post} user/new_nutrition/ingrident/search Search users
 * @apiName Search users
 * @apiGroup User Search
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} name name of user
 * @apiParam {Number} start start of user
 * @apiParam {Number} limit limit of user
 * @apiSuccess (Success 200) {Array}  users  data of users document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/ingrident/search", async (req, res) => {
  var re = new RegExp(
    req.body.name.replace(/[^a-zA-Z ]/g, "").replace(/ +/g, " "),
    "i"
  );
  // var re = new RegExp('^' + req.body.name.replace(/[-/\^$*+?.()|[]{}]/g, '\$&') + '$', 'i')
  var re1 = new RegExp(
    req.body.name
      .replace(/[^a-zA-Z ]/g, "")
      .replace(/ +/g, " ")
      .split(" ")
      .reverse()
      .join(" "),
    "i"
  );
  value = {
    $regex: re
  };

  // value= {
  //   $or: [
  //     {foodName1:{$regex:re}},
  //     {foodName1:{$regex:re1}}
  // ]
  // }

  var projectObject = {
    $project: {
      foodCode: 1,
      description: 1,
      group: 1,
      mainDataReference: 1,
      water: 1,
      totalNitrogen: 1,
      protein: 1,
      fat: 1,
      carbohydrate: 1,
      energyKcal: 1,
      energyKj: 1,
      starch: 1,
      totalSugars: 1,
      glucose: 1,
      galactose: 1,
      fructose: 1,
      sucrose: 1,
      maltose: 1,
      lactose: 1,
      nsp: 1,
      satdFaFd: 1,
      monoFaFood: 1,
      polyFaFood: 1,
      cholesterol: 1,
      _1tsp: 1,
      _1tbsp: 1,
      _1cup: 1,
      _1leaf: 1,
      _1large: 1,
      _1medium: 1,
      _1root: 1,
      _1small: 1,
      _1extra_large: 1,
      _1tip: 1,
      foodName: {
        $ifNull: ["$foodName", ""]
      },
      foodName1: {
        $ifNull: ["$foodName1", ""]
      }
    }
  };

  var searchObject = {
    $match: {
      $or: [{ foodName2: { $regex: re } }, { foodName2: { $regex: re1 } }]
    }
  };

  var start = {
    $skip: parseInt(req.body.start ? req.body.start : 0)
  };
  var offset = {
    $limit: parseInt(req.body.offset ? req.body.offset : 10)
  };

  var resp_data = await new_nutrition_helper.search_proximates(
    autocorrect((req.body.name).toLowerCase()),
    projectObject,
    searchObject,
    start,
    offset
  );

  if (resp_data.status == 1) {
    res.status(config.OK_STATUS).json(resp_data);
  } else {
    res.status(config.OK_STATUS).json(resp_data);
  }
});

// get recent ingredient list
router.get("/ingrident/recent_ingredient", async (req, res) => {
  logger.trace("Get all recent ingredient");

  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var resp_data = await new_nutrition_helper.get_recent_ingredient({
    userId: authUserId
  });
  if (resp_data.status != 0) {
    logger.trace("recent ingredient got successfully = ", resp_data);

    res.status(config.OK_STATUS).json(resp_data);
  } else {
    logger.error(
      "Error occured while fetching recent ingredient = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  }
});

module.exports = router;
