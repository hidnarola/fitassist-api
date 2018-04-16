var express = require("express");
var router = express.Router();

var auth = require("./../middlewares/auth");
var authorization = require("./../middlewares/authorization");


var body_measurement = require("./user/measurement");


router.use("/measurement", auth, authorization, body_measurement);



module.exports = router;
