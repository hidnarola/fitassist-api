var UsersRecipe = require("./../models/users_recipe");
var users_recipe_helper = {};

/*
 * get_user_recipe_by_id is used to fetch all user_recipe by ID
 * 
 * @return  status 0 - If any internal error occured while fetching user's recipe data, with error
 *          status 1 - If user's recipe data found, with user's recipe object
 *          status 2 - If user's recipe not found, with appropriate message
 */
users_recipe_helper.get_user_recipe_by_id = async id => {
  try {
    var user_recipe = await UsersRecipe.find(id);
    if (user_recipe && user_recipe.length > 0) {
      return {
        status: 1,
        message: "user's recipe details found",
        todays_meal: user_recipe
      };
    } else {
      return { status: 2, message: "No user's recipe available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user's recipe",
      error: err
    };
  }
};

/*
 * get_user_nutritions_by_id is used to fetch all user_recipe's nutrition
 * 
 * @return  status 0 - If any internal error occured while fetching user's recipe nutrition data, with error
 *          status 1 - If user's recipe nutrition data found, with user's recipe nutrition object
 *          status 2 - If user's recipe nutrition not found, with appropriate message
 */
users_recipe_helper.get_user_nutritions = async condition => {
  try {
    var user_recipe = await UsersRecipe.aggregate([
      {
        $match: {
          userId: "auth0|5ae705cd17688b753df7be17",
          isCompleted: 1
        }
      },
      { $unwind: "$totalNutrients" },
      {
        $group: {
          _id: "null",
          EnergyMost: { $max: "$totalNutrients.ENERC_KCAL.quantity" },
          Energy: { $sum: "$totalNutrients.ENERC_KCAL.quantity" },
          Saturated: { $sum: "$totalNutrients.FASAT.quantity" },
          Monounsaturated: { $sum: "$totalNutrients.FAMS.quantity" },
          Polyunsaturated: { $sum: "$totalNutrients.FAPU.quantity" },
          Trans: { $sum: "$totalNutrients.FATRN.quantity" },
          Carbs: { $sum: "$totalNutrients.CHOCDF.quantity" },
          Fiber: { $sum: "$totalNutrients.FIBTG.quantity" },
          Protein: { $sum: "$totalNutrients.PROCNT.quantity" },
          Cholesterol: { $sum: "$totalNutrients.CHOLE.quantity" },
          Sodium: { $sum: "$totalNutrients.NA.quantity" },
          Calcium: { $sum: "$totalNutrients.CA.quantity" },
          Magnesium: { $sum: "$totalNutrients.MG.quantity" },
          Potassium: { $sum: "$totalNutrients.K.quantity" },
          Iron: { $sum: "$totalNutrients.FE.quantity" }
        }
      }
    ]);
    if (user_recipe) {
      return {
        status: 1,
        message: "user's recipe details found",
        user_recipe: user_recipe
      };
    } else {
      return { status: 2, message: "No user's recipe available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user's recipe",
      error: err
    };
  }
};
/*
 * get_user_recipe_by_recipe_id is used to fetch all user_recipe by recipe ID
 * 
 * @return  status 0 - If any internal error occured while fetching user's recipe data, with error
 *          status 1 - If user's recipe data found, with user's recipe object
 *          status 2 - If user's recipe not found, with appropriate message
 */
users_recipe_helper.get_user_recipe_by_recipe_id = async id => {
  try {
    var user_recipe = await UsersRecipe.findOne(id);
    console.log(user_recipe);
    if (user_recipe) {
      return {
        status: 1,
        message: "user's recipe details found",
        user_recipe: user_recipe
      };
    } else {
      return { status: 2, message: "No user's recipe available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user's recipe",
      error: err
    };
  }
};
/*
 * insert_user_recipe is used to insert into user_recipes collection
 * 
 * @param   user_recipe_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting user's recipe, with error
 *          status  1 - If user's recipe inserted, with inserted user's recipe document and appropriate message
 * 
 * @developed by "amc"
 */
users_recipe_helper.insert_user_recipe = async user_recipe_object => {
  let user_recipe = new UsersRecipe(user_recipe_object);
  try {
    let user_recipe_data = await UsersRecipe.insertMany(user_recipe_object);
    return {
      status: 1,
      message: "user's recipe inserted",
      user_recipe: user_recipe_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting user_recipe",
      error: err
    };
  }
};

/*
 * complete_recipe is used to Complete user_recipes collection
 * 
 * @param   id     JSON object consist of all property that need to complete in collection
 * 
 * @return  status  0 - If any error occur in completing user's recipe, with error
 *          status  1 - If user's recipe completed, with completed user's recipe document and appropriate message
 * 
 * @developed by "amc"
 */
users_recipe_helper.complete_recipe = async condition => {
  try {
    let user_recipe_data = await UsersRecipe.updateMany(
      condition,
      {
        isCompleted: 1
      },
      {
        new: true
      }
    );

    if (!user_recipe_data && user_recipe_data.n == 0) {
      return { status: 2, message: "recipe not found" };
    } else {
      return {
        status: 1,
        message: "recipe is completed"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while completing user's recipe",
      error: err
    };
  }
};

/*
 * delete_user_recipe is used to delete user_recipes collection
 * 
 * @param   id     JSON object consist of all property that need to delete in collection
 * 
 * @return  status  0 - If any error occur in deleting user's recipe, with error
 *          status  1 - If user's recipe deleted, with deleted user's recipe document and appropriate message
 * 
 * @developed by "amc"
 */
users_recipe_helper.delete_user_recipe = async id => {
  try {
    let user_recipe_data = await UsersRecipe.remove(id);

    if (!user_recipe_data && user_recipe_data.n == 0) {
      return { status: 2, message: "recipe not found" };
    } else {
      return {
        status: 1,
        message: "recipe is deleted"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while deleting user's recipe",
      error: err
    };
  }
};

module.exports = users_recipe_helper;
