var express = require('express');
var router = express.Router();
var config = require('../config');
var user = require('../models/users');
var jwt = require('jsonwebtoken');
var user_helper = require('./../helpers/user_helper');
var common_helper = require('./../helpers/common_helper');
var logger = config.logger;

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

/**
 * @api {post} /user_login User Login
 * @apiName User Login
 * @apiGroup Root
 * 
 * @apiHeader {String}  Content-Type application/json
 * 
 * @apiParam {String} email Email
 * @apiParam {String} password Password
 * 
 * @apiSuccess (Success 200) {JSON} user User object.
 * @apiSuccess (Success 200) {String} token Unique token which needs to be passed in subsequent requests.
 * @apiSuccess (Success 200) {String} refresh_token Unique token which needs to be passed to generate next access token.
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post('/user_login', async (req, res) => {

  logger.trace("API - User login called");
  logger.debug("req.body = ", req.body);

  var schema = {
    'email': {
      notEmpty: true,
      errorMessage: "Email is required.",
      isEmail: { errorMessage: "Please enter valid email address" }
    },
    'password': {
      notEmpty: true,
      errorMessage: "Password is required."
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {
    logger.trace("Valid request of login");

    // Checking for user availability
    logger.trace("Checking for user availability");

    let user_resp = await user_helper.get_user_by_email();
    if (user_resp.status === 0) {
      logger.error("Error in finding user by email in user_login API. Err = ", user_resp.err);

      res.status(config.INTERNAL_SERVER_ERROR).json({ "status": 0, "message": "Something went wrong while finding user", "error": user_resp.error });
    } else if (user_resp.status === 1) {
      logger.trace("User found. Executing next instruction");

      // Checking password
      let password_resp = await common_helper.hash_password.call({ password: req.body.password, hash: user_resp.user.password });
      if (password_resp.status === 0) {
        res.status(config.BAD_REQUEST).json({ "status": 0, "message": "Invalid email address or password" });
      } else {

        if(user_resp.user.status){
          // Generate token
          logger.trace("valid user. Generating token");
          var refreshToken = jwt.sign({ id: user_resp.user._id, role: 'user' }, config.REFRESH_TOKEN_SECRET_KEY, {});

          let update_resp = await user_helper.update_user_by_id(user_resp.user._id, { "refreshToken": refreshToken, "lastLoginDate": Date.now() });

          var userJson = { id: user_resp.user._id, email: user_resp.user.email, role: 'user' };
          var token = jwt.sign(userJson, config.ACCESS_TOKEN_SECRET_KEY, {
            expiresIn: config.ACCESS_TOKEN_EXPIRE_TIME
          });

          delete user_resp.user.password;
          delete user_resp.user.refreshToken;
          delete user_resp.user.lastLoginDate;
          delete user_resp.user.createdAt;
          delete user_resp.user.modifiedAt;

          logger.info("Token generated");
          res.status(config.OK_STATUS).json({ "status": 1, "message": "Logged in successful", "user": user_resp.user, "token": token, "refresh_token": refreshToken });
        } else {
          logger.trace("User account is not active");
          res.status(config.BAD_REQUEST).json({"status":0, "message":"Account is not active"})
        }
      }
    } else {
      logger.info("Account doesn't exist.");
      res.status(config.BAD_REQUEST).json({ "status": 0, "message": "Invalid email address" });
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.BAD_REQUEST).json({ message: errors });
  }
});


router.post('/registration',async (req,res) => {
  logger.trace("API - Registration called");
  logger.debug("req.body = ", req.body);
});

module.exports = router;