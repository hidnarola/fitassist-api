var express = require("express");
var router = express.Router();

var config = require("../../config");
var constant = require("../../constant");
var logger = config.logger;
var jwtDecode = require("jwt-decode");
var request = require("request-promise");
var async = require("async");
var jwtDecode = require("jwt-decode");
var moment = require("moment");

var nutrition_preferences_helper = require("../../helpers/nutrition_preferences_helper");
var user_recipe_helper = require("../../helpers/user_recipe_helper");

/**
 * @api {get} /user/recipe/ Get recipe
 * @apiName Get 
 * @apiGroup User Recipe
 * @apiHeader {String}  x-access-token User's unique access-key
 * @apiSuccess (Success 200) {Array} user_recipe Array of user_recipes 's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  logger.trace("Get all nutrition preference API called : ");
  var resp_data = await nutrition_preferences_helper.get_all_nutrition_preferences(
    { userId: authUserId }
  );

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
    // var randomStrat = Math.floor(Math.random() * 100 + 1);
    var randomStrat = 0;
    var toFrom = "&from=" + randomStrat + "&to=100";
    //console.log("recipeUrl:-->  ", recipeUrl);
    var recipeName = "&q=";
    var Maximum_number_of_ingredients = "&ingr=10";
    var dietSearch = "";

    var healthSearch = "";
    var excludedSearch = "";

    var response;
    var options;

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
        if (nutritionTarget.type === "nutrient") {
          nutritionTargetsSearch +=
            "&nutrient[" +
            nutritionTarget.ntrCode +
            "]=" +
            nutritionTarget.start +
            "&nutrient[" +
            nutritionTarget.ntrCode +
            "]=" +
            nutritionTarget.end;
        } else {
          if (nutritionTarget.start && nutritionTarget.end) {
            nutritionTargetsSearch +=
              "&calories=" + nutritionTarget.start + "-" + nutritionTarget.end;
          }
        }
      });

      var url =
        recipeUrl +
        recipeName +
        dietSearch +
        Maximum_number_of_ingredients +
        healthSearch +
        excludedSearch +
        toFrom +
        nutritionTargetsSearch;
      console.log('url',url);
      
      var options = {
        uri: url,
        json: true // Automatically parses the JSON string in the response
      };

      request(options)
        .then(async repos => {
          let recipes_data = repos.hits;
          let user_meal = {
            breakfast: recipes_data[Math.floor(Math.random() * 100 + 1)].recipe,
            pre_lunch_snacks:
              recipes_data[Math.floor(Math.random() * 100 + 1)].recipe,
            lunch: recipes_data[Math.floor(Math.random() * 100 + 1)].recipe,
            after_lunch_snacks:
              recipes_data[Math.floor(Math.random() * 100 + 1)].recipe,
            dinner: recipes_data[Math.floor(Math.random() * 100 + 1)].recipe
          };
          //   console.log("after lunch",user_meal.after_lunch_snacks);
          var keys = Object.keys(user_meal);
          var insertDataArray = [];
          keys.forEach(async daydrive => {
            recipeObj = {};

            recipeObj.userId = authUserId;
            recipeObj.name = user_meal[daydrive].label;
            recipeObj.image = user_meal[daydrive].image;
            recipeObj.url = user_meal[daydrive].url;
            recipeObj.dietLabels = user_meal[daydrive].dietLabels;
            recipeObj.healthLabels = user_meal[daydrive].healthLabels;
            recipeObj.ingredientLines = user_meal[daydrive].ingredientLines;
            recipeObj.calories = user_meal[daydrive].calories;
            recipeObj.totalWeight = user_meal[daydrive].totalWeight;
            recipeObj.totalTime = user_meal[daydrive].totalTime;
            recipeObj.ingredients = user_meal[daydrive].ingredients;
            recipeObj.totalNutrients = user_meal[daydrive].totalNutrients;
            recipeObj.metaData = user_meal[daydrive];
            recipeObj.dayDriveType = daydrive;
            recipeObj.date = new Date(Date.now()).toLocaleString();

            //  console.log('recipeObj',recipeObj);
            insertDataArray.push(recipeObj);
          });
          let recipe_data = await user_recipe_helper.insert_user_recipe(
            insertDataArray
          );
          // console.log('\nRESPONSE',recipe_data);

          if (recipe_data.status === 0) {
            logger.error("Error while inserting user recipe = ", recipe_data);
            return res.status(config.BAD_REQUEST).json({ recipe_data });
          } else {
            return res.status(config.OK_STATUS).json(recipe_data);
          }

          //   return res.send({"single_user_recipe_meal":single_user_recipe_meal});
        })
        .catch(function(err) {
          console.log("ERROR", err);
        });
    });

    logger.trace(
      "All user's Nutrition Preference got successfully = ",
      resp_data
    );
  }
});

/**
 * @api {post} /user/recipe/ Add
 * @apiName Add
 * @apiGroup User Recipe
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {Object} user_recipe user recipe object
 * @apiSuccess (Success 200) {JSON} user_recipe user_recipes details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */

router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var user_recipe_obj = req.body.user_recipe;
  user_recipe_obj.userId=authUserId

  let user_recipe_data = await user_recipe_helper.insert_user_recipe(
    user_recipe_obj
  );
  if (user_recipe_data.status === 0) {
    logger.error(
      "Error while inserting user recipe = ",
      user_recipe_data
    );
    res.status(config.BAD_REQUEST).json(user_recipe_data);
  } else {
    res.status(config.OK_STATUS).json(user_recipe_data);
  }
});

/**
 * @api {delete} /user/recipe/:recipe_id Delete
 * @apiName Delete
 * @apiGroup User Recipe
 *
 * @apiHeader {String}  x-access-token user's unique access-key
 *
 * @apiSuccess (Success 200) {String} Success message
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.delete("/:recipe_id", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  logger.trace("Delete user's recipe API - Id = ", req.params.recipe_id);
  let user_recipe_data = await user_recipe_helper.delete_user_recipe({
    _id: req.params.recipe_id
  });

  if (user_recipe_data.status === 0) {
    res.status(config.INTERNAL_SERVER_ERROR).json(user_recipe_data);
  } else {
    res.status(config.OK_STATUS).json(user_recipe_data);
  }
});

module.exports = router;
