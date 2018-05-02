var express = require("express");
var router = express.Router();

var config = require("../../config");
var constant = require("../../constant");
var logger = config.logger;
var jwtDecode = require("jwt-decode");
var request = require("request-promise");

var nutrition_preferences_helper = require("../../helpers/nutrition_preferences_helper");

router.get("/", async (req, res) => {
  
  logger.trace("Get all nutrition preference API called : ");
  var resp_data = await nutrition_preferences_helper.get_all_nutrition_preferences(
  );

  if (resp_data.status == 0) {
    logger.error(
      "Error occured while fetching all user's nutrition preference = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
   var recipe_search_object={};
   var cnt=0;
    resp_data.nutrition_preferences.forEach(user => {
      cnt++;
      recipe_search_object.dietRestrictionLabels=user.dietRestrictionLabels
      recipe_search_object.healthRestrictionLabels=user.healthRestrictionLabels
      recipe_search_object.excludeIngredients=user.excludeIngredients
      recipe_search_object.maxRecipeTime=user.maxRecipeTime
      recipe_search_object.nutritionTargets=user.nutritionTargets
      
      console.log("--------------------------------------------------------------------------");

      console.log("recipe_search_object : "+cnt);
      console.log(recipe_search_object);
      
    });
    console.log("--------------------------------------------------------------------------");

    logger.trace("All user's Nutrition Preference got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});


module.exports = router;
