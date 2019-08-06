var NutritionFactors = require("./../models/nutrition_factors");
var Proximates = require("./../models/proximates");
var Inorganics = require("./../models/inorganics");
var Vitamins = require("./../models/vitamins");
var VitaminFractions = require("./../models/vitamin_fractions");
var SfaFa = require("./../models/sfaFa");
var SfaFood = require("./../models/sfaFood");
var mufa = require("./../models/mufa");
var mufaFood = require("./../models/mufaFood");
var pufa = require("./../models/pufa");
var pufaFood = require("./../models/pufaFood");
var phytosterols = require("./../models/phytosterols");
var organic_acids = require("./../models/organic_acids");
var RecentIngredient = require("./../models/recent_ingredient");
var _ = require("underscore");
var new_nutrition_helper = {};

/*
 * insert_nutrition is used to insert multiple nutrion data into nutrition collection
 * 
 * @param   nutrition_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting nutrition, with error
 *          status  1 - If nutrition inserted, with inserted nutrition's document and appropriate message
 * 
 * @developed by "kba"
 */
new_nutrition_helper.insert_nutrition = async nutritions_object => {
  try {
    let nutrition_factor_data = await NutritionFactors.insertMany(
      nutritions_object
    );
    return {
      status: 1,
      message: "Nutrition factor inserted",
      nutrition: nutrition_factor_data
    };
  } catch (err) {
    console.log(err);
    return {
      status: 0,
      message: "Error occured while inserting nutrition factors",
      error: err
    };
  }
};



/*
 * insert_nutrition is used to insert multiple proximates data into proximates collection
 * 
 * @param   proximates_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting proximates, with error
 *          status  1 - If proximates inserted, with inserted proximates's document and appropriate message
 * 
 * @developed by "kba"
 */
new_nutrition_helper.insert_proximates = async proximates_object => {
  console.log("proximates_object => ", proximates_object)
  try {
    let proximates_factor_data = await Proximates.insertMany(
      proximates_object
    );
    console.log("proximates_factor_data", proximates_factor_data);
    return {
      status: 1,
      message: "Proximates inserted",
      proximates: proximates_factor_data
    };
  } catch (err) {
    // console.log(err);
    return {
      status: 0,
      message: "Error occured while inserting proximates",
      error: err
    };
  }
};

// search food ingredients 
new_nutrition_helper.search_proximates = async (
  projectObject,
  searchObject,
  start,
  offset
) => {
  try {
    var proximates = await Proximates.aggregate([
      projectObject,
      searchObject,
      start,
      offset
    ]);


    if (proximates) {
      return {
        status: 1,
        message: "proximates found",
        proximates: proximates
      };
    } else {
      return {
        status: 2,
        message: "No proximates available"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding proximates",
      error: err
    };
  }
};


/*
 * insert_nutrition is used to insert multiple inorganics data into inorganics collection
 * 
 * @param   inorganics_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting inorganics, with error
 *          status  1 - If inorganics inserted, with inserted inorganics's document and appropriate message
 * 
 * @developed by "kba"
 */
new_nutrition_helper.insert_inorganics = async inorganics_object => {
  console.log("inorganics_object => ", inorganics_object)
  try {
    let inorganics_data = await Inorganics.insertMany(
      inorganics_object
    );
    console.log("inorganics_data", inorganics_data);
    return {
      status: 1,
      message: "Inorganics inserted",
      inorganics: inorganics_data
    };
  } catch (err) {
    // console.log(err);
    return {
      status: 0,
      message: "Error occured while inserting inorganics",
      error: err
    };
  }
};


/*
 * insert_nutrition is used to insert multiple vitamins data into vitamins collection
 * 
 * @param   vitamins_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting vitamins, with error
 *          status  1 - If vitamins inserted, with inserted vitamins's document and appropriate message
 * 
 * @developed by "kba"
 */
new_nutrition_helper.insert_vitamins = async vitamins_object => {
  console.log("vitamins_object => ", vitamins_object)
  try {
    let vitamins_data = await Vitamins.insertMany(
      vitamins_object
    );
    console.log("vitamins_data", vitamins_data);
    return {
      status: 1,
      message: "Vitamins inserted",
      vitamins: vitamins_data
    };
  } catch (err) {
    // console.log(err);
    return {
      status: 0,
      message: "Error occured while inserting vitamins",
      error: err
    };
  }
};

/*
 * insert_nutrition is used to insert multiple vitamins data into vitamins collection
 * 
 * @param   vitamins_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting vitamins, with error
 *          status  1 - If vitamins inserted, with inserted vitamins's document and appropriate message
 * 
 * @developed by "kba"
 */
new_nutrition_helper.insert_vitamin_fractions = async vitamin_fractions_object => {
  // console.log("vitamin_fractions_object => ", vitamin_fractions_object)
  try {
    let vitamins_data = await VitaminFractions.insertMany(
      vitamin_fractions_object
    );
    console.log("vitamin_fractions_data ===>", vitamin_fractions_object);
    return {
      status: 1,
      message: "VitaminFractions inserted",
      vitamins: vitamins_data
    };
  } catch (err) {
    console.log(err);
    return {
      status: 0,
      message: "Error occured while inserting vitaminfractions",
      error: err
    };
  }
};

/*
 * insert_nutrition is used to insert multiple sfaFa data into sfaFa collection
 * 
 * @param   vitamins_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting sfaFa, with error
 *          status  1 - If sfaFa inserted, with inserted sfaFa's document and appropriate message
 * 
 * @developed by "kba"
 */
new_nutrition_helper.insert_sfaFa = async sfaFa_object => {
  // console.log("sfaFa_object => ", sfaFa_object)
  try {
    let sfaFa_data = await SfaFa.insertMany(
      sfaFa_object
    );
    console.log("sfaFa ===>", sfaFa_object);
    return {
      status: 1,
      message: "sfaFa inserted",
      sfaFa: sfaFa_data
    };
  } catch (err) {
    console.log(err);
    return {
      status: 0,
      message: "Error occured while inserting sfaFa",
      error: err
    };
  }
};

/*
 * insert_nutrition is used to insert multiple sfaFa data into sfaFa collection
 * 
 * @param   vitamins_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting sfaFa, with error
 *          status  1 - If sfaFa inserted, with inserted sfaFa's document and appropriate message
 * 
 * @developed by "kba"
 */
new_nutrition_helper.insert_sfaFood = async sfaFood_object => {
  try {
    let sfa_Food_data = await SfaFood.insertMany(
      sfaFood_object
    );
    console.log("sfaFood ===>", sfaFood_object);
    return {
      status: 1,
      message: "sfaFood inserted",
      sfaFood: sfa_Food_data
    };
  } catch (err) {
    console.log(err);
    return {
      status: 0,
      message: "Error occured while inserting sfaFood",
      error: err
    };
  }
};


/*
 * insert_nutrition is used to insert multiple sfaFa data into sfaFa collection
 * 
 * @param   vitamins_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting sfaFa, with error
 *          status  1 - If sfaFa inserted, with inserted sfaFa's document and appropriate message
 * 
 * @developed by "kba"
 */
new_nutrition_helper.insert_mufa = async mufa_object => {
  try {
    let mufa_data = await mufa.insertMany(
      mufa_object
    );
    console.log("mufa ===>", mufa_object);
    return {
      status: 1,
      message: "mufa inserted",
      mufa: mufa_data
    };
  } catch (err) {
    console.log(err);
    return {
      status: 0,
      message: "Error occured while inserting mufa",
      error: err
    };
  }
};

/*
 * insert_nutrition is used to insert multiple sfaFa data into sfaFa collection
 * 
 * @param   vitamins_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting sfaFa, with error
 *          status  1 - If sfaFa inserted, with inserted sfaFa's document and appropriate message
 * 
 * @developed by "kba"
 */
new_nutrition_helper.insert_mufaFood = async mufaFood_object => {
  try {
    let mufaFood_data = await mufaFood.insertMany(
      mufaFood_object
    );
    let a = {
      status: 1,
      message: "mufa food inserted",
      mufaFood: mufaFood_data
    };
    return a;
  } catch (err) {
    console.log(err);
    return {
      status: 0,
      message: "Error occured while inserting mufaFood",
      error: err
    };
  }
};



/*
 * insert_nutrition is used to insert multiple pufa data into pufa collection
 * 
 * @param   vitamins_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting pufa, with error
 *          status  1 - If pufa inserted, with inserted pufa's document and appropriate message
 * 
 * @developed by "kba"
 */
new_nutrition_helper.insert_pufa = async pufa_object => {
  try {
    let pufa_data = await pufa.insertMany(
      pufa_object
    );
    console.log("pufa new_nutrition_helper===>");
    return {
      status: 1,
      message: "pufa inserted",
      pufa: pufa_data
    };
  } catch (err) {
    console.log(err);
    return {
      status: 0,
      message: "Error occured while inserting pufa",
      error: err
    };
  }
};

/*
 * insert_nutrition is used to insert multiple pufaFood data into pufaFood collection
 * 
 * @param   vitamins_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting pufaFood, with error
 *          status  1 - If pufaFood inserted, with inserted pufaFood's document and appropriate message
 * 
 * @developed by "kba"
 */
new_nutrition_helper.insert_pufaFood = async pufa_object => {
  try {
    let pufa_data = await pufaFood.insertMany(
      pufa_object
    );
    console.log("pufaFood new_nutrition_helper===>");
    return {
      status: 1,
      message: "pufaFood inserted",
      pufaFood: pufa_data
    };
  } catch (err) {
    console.log(err);
    return {
      status: 0,
      message: "Error occured while inserting pufaFood",
      error: err
    };
  }
};


/*
 * insert_nutrition is used to insert multiple phytosterols data into phytosterols collection
 * 
 * @param   vitamins_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting phytosterols, with error
 *          status  1 - If phytosterols inserted, with inserted phytosterols's document and appropriate message
 * 
 * @developed by "kba"
 */
new_nutrition_helper.insert_phytosterols = async phytosterols_object => {
  try {
    let phytosterols_data = await phytosterols.insertMany(
      phytosterols_object
    );
    console.log("phytosterols new_nutrition_helper===>");
    return {
      status: 1,
      message: "phytosterols inserted",
      phytosterols: phytosterols_data
    };
  } catch (err) {
    console.log(err);
    return {
      status: 0,
      message: "Error occured while inserting phytosterols",
      error: err
    };
  }
};


/*
 * insert_nutrition is used to insert multiple organic_acids data into organic_acids collection
 * 
 * @param   vitamins_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting organic_acids, with error
 *          status  1 - If organic_acids inserted, with inserted organic_acids's document and appropriate message
 * 
 * @developed by "kba"
 */
new_nutrition_helper.insert_organic_acids = async organic_acids_object => {
  try {
    let organic_acids_data = await organic_acids.insertMany(
      organic_acids_object
    );
    console.log("organic_acids new_nutrition_helper===>");
    return {
      status: 1,
      message: "organic_acids inserted",
      organic_acids: organic_acids_data
    };
  } catch (err) {
    console.log(err);
    return {
      status: 0,
      message: "Error occured while inserting organic_acids",
      error: err
    };
  }
};


// insert recent ingredient
new_nutrition_helper.insert_recent_ingredient = async meals_obj => {
  try {

    let recent_ingredient = await RecentIngredient.findOne({ userId: meals_obj.userId });

    if (recent_ingredient && recent_ingredient.ingredients && recent_ingredient.ingredients.length > 0) {
      // ingredients available for userId

      let _recent_ingredient = [];
      recent_ingredient.ingredients.forEach(element => {
        _recent_ingredient.push({
          ...element,
          ingredient_id: String(element.ingredient_id)
        })
      });
      var _new_ingredient = meals_obj.ingredientsIncluded;

      _new_ingredient.forEach((element, id) => {
        let firstEl = _recent_ingredient[0];
        let firstEl2 = element;

        let _index = _.findIndex(_recent_ingredient, { 'ingredient_id': element.ingredient_id });

        if (_index >= 0) {
          // update createdAt
          _recent_ingredient[_index] = {
            ...element,
            createdAt: new Date()
          }
        } else {
          if (_recent_ingredient.length >= 10) {

            // pop and push
            _recent_ingredient = (_.sortBy(_recent_ingredient, ['createdAt'])).reverse();
            _recent_ingredient.pop();
            _recent_ingredient.push(element);
          } else {

            // push
            _recent_ingredient.push(element);
          }
        }
      });

      // update query
      var updated_object = await RecentIngredient.update({ "_id": recent_ingredient._id }, {
        $set: {
          ingredients: _recent_ingredient
        }
      })



    } else {
      // ingredients not available for userId
      console.log('meals_obj.ingredientsIncluded.length => ', meals_obj.ingredientsIncluded.length);

      if (meals_obj.ingredientsIncluded && meals_obj.ingredientsIncluded.length > 0 && meals_obj.ingredientsIncluded.length < 11) {
        // insert all ingredient 
        var added_ingredient = await RecentIngredient.create({
          userId: meals_obj.userId,
          ingredients: meals_obj.ingredientsIncluded
        })

        console.log("added_ingredient =>", added_ingredient);

      } else if (meals_obj.ingredientsIncluded.length > 10) {

        // insert last 10 ingredient
        var arr = meals_obj.ingredientsIncluded;
        var oder_data = arr.slice(-10);
        console.log('order_data => ', oder_data);

        var added_ingredient = await RecentIngredient.create({
          userId: meals_obj.userId,
          ingredients: oder_data
        })


      } else {
        // no incoming ingredients
        console.log('else => ');
        console.log("no incoming ingredients");
      }


    }

  } catch (error) {
    console.log("error =>", error);
  }

}

//get recent ingredient
new_nutrition_helper.get_recent_ingredient = async condition => {
  try {
    var recent_ingredient = await RecentIngredient.aggregate([
      {
        $match: condition
      },
      { "$unwind": "$ingredients" },
      {
        "$lookup": {
          "from": "proximates",
          "localField": "ingredients.ingredient_id",
          "foreignField": "_id",
          "as": "ingredients"
        }
      },
      { "$unwind": "$ingredients" },
      {
        "$group": {
          "_id": "$_id",
          "ingredients": { "$push": "$ingredients" },
          "userId": { $first: "$userId" }
        }
      }
    ]);
    if (recent_ingredient) {
      return {
        status: 1,
        message: "user's recent ingredient details found",
        recent_ingredient: recent_ingredient
      };
    } else {
      return { status: 2, message: "User's recent ingredient are not available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user's recent ingredient",
      error: err
    };
  }
};

module.exports = new_nutrition_helper;
