
var Meals = require("./../models/meals");
var meals_helper = {};

meals_helper.insert_meal = async meal_obj => {
    let meal = new Meals(meal_obj);
    try {
        let meal_data = await meal.save();
        return { status: 1, message: "meal inserted", meal: meal_data };
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while inserting meal",
            error: err
        };
    }
};

module.exports = meals_helper;
