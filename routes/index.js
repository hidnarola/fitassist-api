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
 * @apiDescription  
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

    let user_resp = await user_helper.get_user_by_email(req.body.email);
    logger.trace("User checked resp = ", user_resp);
    if (user_resp.status === 0) {
      logger.error("Error in finding user by email in user_login API. Err = ", user_resp.err);

      res.status(config.INTERNAL_SERVER_ERROR).json({ "status": 0, "message": "Something went wrong while finding user", "error": user_resp.error });
    } else if (user_resp.status === 1) {
      logger.trace("User found. Executing next instruction");

      // Checking password

      common_helper.hashPassword.call({ password: req.body.password, hash: user_resp.user.password }, async (password_resp) => {
        logger.trace("password resp = ", password_resp);
        if (password_resp.status === 0 || password_resp.res === false) {
          res.status(config.BAD_REQUEST).json({ "status": 0, "message": "Invalid email address or password" });
        } else {
          if (user_resp.user.status) {
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
            res.status(config.BAD_REQUEST).json({ "status": 0, "message": "Account is not active" })
          }
        }
      });

    } else {
      logger.info("Account doesn't exist.");
      res.status(config.BAD_REQUEST).json({ "status": 0, "message": "Invalid email address" });
    }
  } else {
    logger.error("Validation Error = ", errors);
    res.status(config.BAD_REQUEST).json({ message: errors });
  }
});

/**
 * @api {post} /user_signup User Signup
 * @apiName User Signup
 * @apiGroup Root
 * 
 * @apiDescription  
 * 
 * @apiHeader {String}  Content-Type application/json
 * 
 * @apiParam {String} first_name First name of user
 * @apiParam {String} last_name Last name of user
 * @apiParam {String} username Username
 * @apiParam {String} email Email address
 * @apiParam {String} password Password
 * @apiParam {String} gender Gender of the user. Value can be either male, female or transgender
 * @apiParam {String} date_of_birth Date of birth. Value ISO date in string format
 * @apiParam {Number} height Height of the user in inch
 * @apiParam {Number} weight Weight of the user in KG
 * @apiParam {String} goal User's goal. Value can be from 'Gain Muscle','Gain Flexibility','Lose Fat','Gain Strength','Gain Power','Increase Endurance'
 * @apiParam {Number} workout_intensity Workout intensity of user (Between 0 to 100)
 * @apiParam {Number} experience_level Experience level of user (Between 0 to 100)
 * @apiParam {Number} workput_location Workout location of user. Value must be either home or gym
 * 
 * @apiSuccess (Success 200) {String} message Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post('/user_signup', async (req, res) => {

  let resp = await user_helper.insert_user({ "firstName": "Sahil", "lastName": "Bhojani", "username": "sb", "password": "narola21", "email": "sb@narola.email", "gender": "male" });
  res.status(200).json(resp);
  // logger.trace("API - User signup called");
  // logger.debug("req.body = ", req.body);
  // var schema = {
  //     'first_name': {
  //         notEmpty: true,
  //         errorMessage: "First name is required"
  //     },
  //     'last_name': {
  //         notEmpty: true,
  //         errorMessage: "Last name is required"
  //     },
  //     'username': {
  //       notEmpty: true,
  //       errorMessage: "Username is required"
  //     },
  //     'email': {
  //         notEmpty: true,
  //         errorMessage: "Email address is required",
  //         isEmail: {errorMessage: "Please enter valid email address"}
  //     },
  //     'password': {
  //       notEmpty: true,
  //       errorMessage: "Password is required"
  //     },
  //     'gender': {
  //         notEmpty: true,
  //         isIn: {
  //           options: [['male', 'female', 'transgender']],
  //           errorMessage: 'Gender can be from male, female or transgender'
  //         },
  //         errorMessage: "Gender is required",
  //     },
  //     'date_of_birth': {
  //       notEmpty: true,
  //       errorMessage: "Birth date is required"
  //     },
  //     'height': {
  //         notEmpty: true,
  //         errorMessage: "Height is required"
  //     },
  //     'weight': {
  //         notEmpty: true,
  //         errorMessage: "Weight is required"
  //     },
  //     'goal': {
  //         notEmpty: true,
  //         errorMessage: "Goal is required"
  //     },
  //     'workout_intensity': {
  //         notEmpty: true,
  //         isNumeric: {errorMessage: "Intensity should be valid number"},
  //         errorMessage: "Workout intensity is required"
  //     },
  //     'experience_level': {
  //         notEmpty: true,
  //         errorMessage: "Experience level is required"
  //     },
  //     'workout_location': {
  //         notEmpty: true,
  //         isIn: {
  //           options: [['home', 'gym']],
  //           errorMessage: 'Workout location must be either home or gym'
  //         },
  //         errorMessage: "Workout location is required"
  //     }
  // };
  // req.checkBody(schema);
  // var errors = req.validationErrors();
  // if (!errors) {

  // } else {
  //   logger.error("Validation Error = ", errors);
  //   res.status(config.BAD_REQUEST).json({ message: errors });
  // }
});
module.exports = router;