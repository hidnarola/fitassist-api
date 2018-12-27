const express = require("express");
const async = require("async");

const config = require("../../config");

const follow_helper = require("../../helpers/follow_helper");

const router = express.Router();
const logger = config.logger;

router.post("/", async (req, res) => {
    try {
        let schema = {
            followingId: {
                notEmpty: true,
                errorMessage: "Following id is required"
            }
        };
        req.checkBody(schema);
        let errors = req.validationErrors();
        if (!errors) {
            const {followingId} = req.body;
            let decoded = jwtDecode(req.headers["authorization"]);
            let authUserId = decoded.sub;
            if (authUserId === followingId) {
                let responseObj = {
                    status: 0,
                    message: "You can't follow your self",
                    error: "You can't follow your self"
                };
                return res.status(config.BAD_REQUEST).json(responseObj);
            }
            let followingRes = await follow_helper.checkFollow(authUserId);
            let responseStatus = config.INTERNAL_SERVER_ERROR;
            let responseObj = {};
            if (followingRes && followingRes.status === 2) {
                let dataToStore = {
                    userId: authUserId,
                    followingId: followingId
                };
                let insertedRes = await follow_helper.start_following(dataToStore);
                if (insertedRes && insertedRes.status === 1) {
                    // notification by socket remaining
                    responseStatus = config.OK_STATUS;
                    responseObj = {
                        status: 1,
                        message: "You started following",
                        data: insertedRes.follow
                    };
                } else {
                    responseStatus = config.BAD_REQUEST;
                    responseObj = {
                        status: 0,
                        message: "You are alread following/followed",
                        error: null
                    };
                }
            } else if (followingRes && followingRes.status === 1) {
                responseStatus = config.BAD_REQUEST;
                responseObj = {
                    status: 0,
                    message: "You are alread following/followed",
                    error: null
                };
            } else {
                responseStatus = config.INTERNAL_SERVER_ERROR;
                responseObj = {
                    status: 0,
                    message: "Something went wrong! please try again later.",
                    error: null
                };
            }
            res.status(responseStatus).json(responseObj);
        } else {
            logger.error("Validation Error = ", errors);
            let responseObj = {
                status: 0,
                message: errors,
                errors: errors
            };
            res.status(config.VALIDATION_FAILURE_STATUS).json(responseObj);
        }
    } catch (error) {
        logger.error("Internal Server Error = ", errors);
        let responseObj = {
            status: 0,
            message: "Something went wrong! Please try again later.",
            errors: error
        };
        res.status(config.INTERNAL_SERVER_ERROR).json(responseObj);
    }
});

router.get("/", async () => {
    try {
        
    } catch (error) {
        
    }
});

module.exports = router;