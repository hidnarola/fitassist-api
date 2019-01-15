const express = require("express");
const async = require("async");
var jwtDecode = require("jwt-decode");
const mongoose = require('mongoose');

const config = require("../../config");

const follow_helper = require("../../helpers/follow_helper");

const router = express.Router();
const logger = config.logger;

router.post('/', async(req, res) => {
    try {
        var schema = {
            followingId: {
                notEmpty: true,
                errorMessage: "Following id is required"
            }
        };
        req.checkBody(schema);
        var errors = req.validationErrors();
        if (!errors) {
            var decoded = jwtDecode(req.headers["authorization"]);
            var authUserId = decoded.sub;
            let {followingId} = req.body;
            let requestData = {
                followerId: authUserId,
                followingId
            };
            let followingRes = await follow_helper.getFollowing(authUserId, followingId);
            if (followingRes && followingRes.status === 1) {
                let followingData = followingRes.data;
                if (!followingData) {
                    let response = await follow_helper.startFollowing(requestData);
                    if (response && response.status === 1) {
                        res.status(config.OK_STATUS).json(response);
                    } else {
                        res.status(config.BAD_REQUEST).json(response);
                    }
                } else {
                    logger.error("Already following = ", null);
                    let responseData = {
                        status: 0,
                        message: "You are already following.",
                        error: ["You are already following."]
                    };
                    res.status(config.BAD_REQUEST).json(responseData);
                }
            } else {
                logger.error("Finding following error = ", null);
                let responseData = {
                    status: 0,
                    message: "Something went wrong! please try again later.",
                    error: ["Something went wrong! please try again later."]
                };
                res.status(config.INTERNAL_SERVER_ERROR).json(responseData);
            }
        } else {
            logger.error("Validation Error = ", errors);
            res.status(config.VALIDATION_FAILURE_STATUS).json({
                status: 0,
                message: errors
            });
        }
    } catch (error) {
        let responseData = {
            status: 0,
            message: "Something went wrong! please try again later.",
            error: ["Something went wrong! please try again later."]
        };
        res.status(config.INTERNAL_SERVER_ERROR).json(responseData);
    }
});

router.post('/stop', async(req, res) => {
    try {
        let {_id} = req.body;
        _id = mongoose.Types.ObjectId(_id);
        let requestData = {_id};
        let response = await follow_helper.stopFollowing(requestData);
        if (response && response.status === 1) {
            res.status(config.OK_STATUS).json(response);
        } else {
            res.status(config.BAD_REQUEST).json(response);
        }
    } catch (error) {
        let responseData = {
            status: 0,
            message: "Something went wrong! please try again later.",
            error: ["Something went wrong! please try again later."]
        };
        res.status(config.INTERNAL_SERVER_ERROR).json(responseData);
    }
});

module.exports = router;