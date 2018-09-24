var express = require("express");
var fs = require("fs");
var path = require("path");
var request = require("request");
var async = require("async");
var jwtDecode = require("jwt-decode");
var router = express.Router();
var config = require("../../config");
var logger = config.logger;


/**
 * @api {put} /user/change_password  Change Password
 * @apiName Change Password
 * @apiGroup  User Change Password
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {String} newPassword newPassword of user
 * @apiSuccess (Success 200) {JSON} user updated user detail
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.put("/", async (req, res) => {
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;
    var schema = {
        newPassword: {
            notEmpty: true,
            isLength: {
                errorMessage: 'New Password should be between 8 to 50 characters',
                options: {
                    min: 0,
                    max: 50
                }
            },
            errorMessage: "New password is required"
        }
    };
    req.checkBody(schema);
    var errors = req.validationErrors();
    if (!errors) {
        var options = {
            method: 'POST',
            url: config.AUTH_TOKEN_URL,
            headers: {
                'content-type': 'application/json'
            },
            body: {
                grant_type: config.GRANT_TYPE,
                client_id: config.CLIENT_ID,
                client_secret: config.CLIENT_SECRET,
                audience: config.AUDIENCE
            },
            json: true
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            if (body) {
                var options = {
                    method: 'PATCH',
                    url: config.AUTH_USER_API_URL + authUserId,
                    headers: {
                        'content-type': 'application/json',
                        "Authorization": 'Bearer ' + body.access_token
                    },
                    body: {
                        password: req.body.newPassword,
                        connection: 'Username-Password-Authentication'
                    },
                    json: true
                };

                request(options, function (error, response, body) {
                    if (error) throw new Error(error);
                    logger.trace("password changed successfully");
                    res.status(config.OK_STATUS).json({
                        user: body
                    });
                });
            }
        });
    } else {
        logger.error("Validation Error = ", errors);
        res.status(config.VALIDATION_FAILURE_STATUS).json({
            message: errors
        });
    }
});


module.exports = router;