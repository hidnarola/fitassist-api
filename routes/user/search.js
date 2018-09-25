var express = require("express");
var router = express.Router();
var config = require("../../config");
var user_helper = require("../../helpers/user_helper");

/**
 * @api {post} /user/search Search users
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
router.post("/", async (req, res) => {
  var re = new RegExp(req.body.name, "i");
  value = {
    $regex: re
  };

  var projectObject = {
    $project: {
      fullName: {
        $concat: [{
            $ifNull: ["$firstName", ""]
          },
          " ",
          {
            $ifNull: ["$lastName", ""]
          }
        ]
      },
      firstName: 1,
      lastName: 1,
      avatar: 1,
      authUserId: 1,
      username: 1
    }
  };

  var searchObject = {
    $match: {
      $or: [{
          firstName: value
        },
        {
          lastName: value
        },
        {
          username: value
        },
        {
          fullName: value
        }
      ]
    }
  };

  var start = {
    $skip: parseInt(req.body.start ? req.body.start : 0)
  };
  var offset = {
    $limit: parseInt(req.body.offset ? req.body.offset : 10)
  };

  var resp_data = await user_helper.search_users(
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

module.exports = router;