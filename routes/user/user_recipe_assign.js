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
    var Maximum_number_of_ingredients = "&ingr=5";
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

      var options = {
        uri: url,
        json: true // Automatically parses the JSON string in the response
      };

      request(options)
        .then(async (repos)=> {
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
          console.log("data:->",insertDataArray);
              let recipe_data = await user_recipe_helper.insert_user_recipe(
                insertDataArray
              );
              // console.log('\nRESPONSE',recipe_data);
  
              if (recipe_data.status === 0) {
                logger.error("Error while inserting user recipe = ", recipe_data);
                //return res.status(config.BAD_REQUEST).json({ recipe_data });
              } else {
                //return res.status(config.OK_STATUS).json(recipe_data);
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
 * @api {post} /user/user_recipe_assign Get User recipe by Date
 * @apiName Get User Measurement by User Id and LogDate
 * @apiGroup Get User recipe by Date
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization User's unique access-key
 * @apiParam {Date} date date of recipe
 * @apiSuccess (Success 200) {Array}  user_recipe  data of user_recipes document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  date = req.body.date;
  console.log("Logdate: ", date);
  var schema = {
    date: {
          notEmpty: true,
          errorMessage: "Date is required"
      }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();
  var recipe_obj = {
      status: 1,
      message: "",
      user_recipe: {}
  };
  if (!errors) {
      // var startdate = moment(logDate).utcOffset(0);
      var startdate = moment(date);
      startdate.set({hour: 0, minute: 0, second: 0, millisecond: 0});
      startdate.toISOString();
      startdate.format();

      var enddate = moment(date);
      enddate.set({hour: 23, minute: 59, second: 59, millisecond: 99});
      enddate.toISOString();
      enddate.format();

      logger.trace("Get user_recipe by date API called");
      var resp_data = await user_recipe_helper.get_user_recipe_by_id({
          userId: authUserId,
          date: {
              $gte: startdate,
              $lte: enddate
          }
      });
      if (resp_data.status == 1 || resp_data.status == 2) {
          recipe_obj.status = resp_data.status;
          recipe_obj.message = resp_data.message;
          if (resp_data.user_recipe) {
              recipe_obj.user_recipe = resp_data.user_recipe;
          }
          res.status(config.OK_STATUS).json(recipe_obj);
      }
  } else {
      logger.error("Validation Error = ", errors);
      res.status(config.BAD_REQUEST).json({message: errors});
  }
});



module.exports = router;
