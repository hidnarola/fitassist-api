var express = require("express");
var router = express.Router();
var config = require("../../config");
var logger = config.logger;
var jwtDecode = require("jwt-decode");

router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  var schema = {
    meals: {
      notEmpty: true,
      errorMessage: "meals is required"
    },
    meals_visibility: {
      notEmpty: true,
      errorMessage: "meals_visibility is required"
    },
    ingredientsIncluded: {
      notEmpty: true,
      errorMessage: "ingredients is required"
    }
  };
});

module.exports = router;
