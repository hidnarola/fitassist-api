var UsersRecipe = require("./../models/users_recipe");
var users_recipe_helper = {};

/*
 * get_user_recipe_by_id is used to fetch all user_recipe by ID
 * 
 * @return  status 0 - If any internal error occured while fetching user's recipe data, with error
 *          status 1 - If user's recipe data found, with user's recipe object
 *          status 2 - If user's recipe not found, with appropriate message
 */
users_recipe_helper.get_user_recipe_by_id = async (id) => {
    try {
        var user_recipe = await UsersRecipe.find(id);
        if (user_recipe) {
            return { "status": 1, "message": "user's recipe details found", "user_recipes": user_recipe };
        } else {
            return { "status": 2, "message": "No user's recipe available" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while finding user's recipe", "error": err }
    }
}

/*
 * insert_user_recipe is used to insert into user_recipes collection
 * 
 * @param   user_recipe_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting user's recipe, with error
 *          status  1 - If user's recipe inserted, with inserted user's recipe document and appropriate message
 * 
 * @developed by "ar"
 */
users_recipe_helper.insert_user_recipe = async (user_recipe_object) => {
    let user_recipe = new UsersRecipe(user_recipe_object);
    try {
        let user_recipe_data = await UsersRecipe.insertMany(user_recipe_object);
        return { "status": 1, "message": "user's recipe inserted", "user_recipe": user_recipe_data };
    } catch (err) {
        return { "status": 0, "message": "Error occured while inserting user_recipe", "error": err };
    }
};


module.exports = users_recipe_helper;