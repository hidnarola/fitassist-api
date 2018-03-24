var express = require('express');
var router = express.Router();

var nutrition = require('./admin/nutrition');
var auth = require('./../middlewares/auth');
var authorization = require('./../middlewares/authorization');

router.use('/nutrition',auth, authorization, nutrition);

module.exports = router;