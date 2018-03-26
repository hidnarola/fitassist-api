var express = require('express');
var router = express.Router();

var auth = require('./../middlewares/auth');
var authorization = require('./../middlewares/authorization');

var nutrition = require('./admin/nutrition');
var equipment_category = require('./admin/equipment_category');

router.use('/nutrition',auth, authorization, nutrition);
router.use('/equipment_category',auth, authorization, equipment_category);

module.exports = router;