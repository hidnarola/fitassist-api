var Exercise_preference = require("./../models/exercise_preferences");
var exercise_preference_helper = {};

/*
 * insert_prefernece is used to insert into exercise preference
 * 
 * @param   preference_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting preference, with error
 *          status  1 - If prefernece inserted, with inserted prefernece document and appropriate message
 * 
 * @developed by "ar"
 */
exercise_preference_helper.insert_prefernece = async (preference_object) => {
    let exercise_preference = new Exercise_preference(preference_object)
    try{
        let preference_data = await exercise_preference.save();
        return { "status": 1, "message": "User's exercise preference inserted", "exercise_preference": preference_data };
    } catch(err){
        return { "status": 0, "message":"Error occured while inserting user's exercise prefernece","error": err };
    }
};

module.exports = exercise_preference_helper;