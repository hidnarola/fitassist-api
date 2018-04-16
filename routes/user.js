var express = require("express");
var router = express.Router();

var auth = require("./../middlewares/auth");
var authorization = require("./../middlewares/authorization");

var nutrition = require("./admin/nutrition");


router.use("/nutrition", auth, authorization, nutrition);



module.exports = router;
