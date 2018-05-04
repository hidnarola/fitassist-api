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
  var resp_data = await nutrition_preferences_helper.get_all_nutrition_preferences();

  if (resp_data.status == 0) {
    logger.error(
      "Error occured while fetching all user's nutrition preference = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    var all_user_preferences = [];

    var cnt = 0;
    resp_data.nutrition_preferences.forEach(user => {
      var recipe_search_object = {};
      cnt++;

      recipe_search_object._id = user._id;
      recipe_search_object.dietRestrictionLabels = user.dietRestrictionLabels;
      recipe_search_object.healthRestrictionLabels =
        user.healthRestrictionLabels;
      recipe_search_object.excludeIngredients = user.excludeIngredients;
      recipe_search_object.maxRecipeTime = user.maxRecipeTime;
      recipe_search_object.nutritionTargets = user.nutritionTargets;
      all_user_preferences.push(recipe_search_object);
    });
    var recipeUrl = config.RECIPE_API_URL;
    //console.log("recipeUrl:-->  ", recipeUrl);
    var recipeName = "&q=";
    var Maximum_number_of_ingredients = "&ingr=5";
    var dietSearch = "";

    var healthSearch = "";
    var excludedSearch = "";

    all_user_preferences.forEach(user_preferences => {
      dietSearch = "";
      healthSearch = "";
      excludedSearch = "";
      nutritionTargetsSearch = "";
      
      user_preferences.dietRestrictionLabels.forEach(diet => {
        dietSearch += "&diet=" + diet;
      });
      user_preferences.healthRestrictionLabels.forEach(health => {
        healthSearch += "&health=" + health;
      });
      user_preferences.excludeIngredients.forEach(excluded => {
        excludedSearch += "&excluded=" + excluded;
      });
      user_preferences.nutritionTargets.forEach(nutritionTarget => {
        if(nutritionTarget.type==="nutrient")
        {
          nutritionTargetsSearch += "&nutrient["+ nutritionTarget.ntrCode  +"]=" + nutritionTarget.start+ "&nutrient["+ nutritionTarget.ntrCode  +"]=" + nutritionTarget.end;        
        }
        else{          
          nutritionTargetsSearch += "&calories="+ nutritionTarget.start +"-"+nutritionTarget.end;
        }
      });
      console.log('------------------------------------------------------------------------------------------------------------------------------------------------------------');
      console.log(
        "URL for :->   " + user_preferences._id,
        recipeUrl +
          recipeName +
          dietSearch +
          Maximum_number_of_ingredients +
          healthSearch +
          excludedSearch+
          nutritionTargetsSearch
      );
    });
    console.log('------------------------------------------------------------------------------------------------------------------------------------------------------------');

    logger.trace(
      "All user's Nutrition Preference got successfully = ",
      resp_data
    );
    res.status(config.OK_STATUS).json(resp_data);
  }
});

module.exports = router;
