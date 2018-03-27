var Exercise_types = require("./../models/exercise_types");
var exercise_types_helper = {};

/*
 * get_all_exercise_types is used to fetch all exercise_types
 * 
 * @return  status 0 - If any internal error occured while fetching exercise_types data, with error
 *          status 1 - If exercise_types data found, with exercise_types object
 *          status 2 - If exercise_types not found, with appropriate message
 * 
 * @developed by "amc"

 */
exercise_types_helper.get_all_exercise_types = async () => {
    try {
        var exercise_types = await Exercise_types.find();
        if (exercise_types) {
            return { "status": 1, "message": "Exercise Types found", "equipments": exercise_types };
        } else {
            return { "status": 2, "message": "No Exercise Types available" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while finding Exercise Types", "error": err }
    }
}


/*
 * exercise_type_id is used to fetch exercise type by ID
 * 
 * @return  status 0 - If any internal error occured while fetching exercise type data, with error
 *          status 1 - If exercise type data found, with exercise type object
 *          status 2 - If exercise type not found, with appropriate message
 * 
 * @ developed by "amc"
 */
exercise_types_helper.get_exercise_type_id = async (id) => {
    try {
        var exercise_types = await Exercise_types.find({_id:id});
        if (exercise_types) {
            return { "status": 1, "message": "Exercise type  found", "Exercise Types": exercise_types };
        } else {
            return { "status": 2, "message": "No Exercise Types available" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while finding Exercise Types", "error": err }
    }
}

/*
 * insert_exercise_type is used to insert into exercise_types collection
 * 
 * @param   exercise_type_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting exercise type, with error
 *          status  1 - If exercise type inserted, with inserted exercise type document and appropriate message
 * 
 * @developed by "amc"
 */
exercise_types_helper.insert_exercise_type = async (exercise_types_object) => {
    console.log(exercise_types_object);
    let Exercise_type = new Exercise_types(exercise_types_object);
    try {
        let exercise_types_data = await Exercise_type.save();
        return { "status": 1, "message": "Exercise Types inserted", "equipment": exercise_types_data };
    } catch (err) {
        return { "status": 0, "message": "Error occured while inserting Exercise Types", "error": err };
    }
};

/*
 * update_exercise_type_by_id is used to update exercise types data based on exercise_type_id
 * 
 * @param   exercise_type_id         String  _id of exercise_types that need to be update
 * @param   exercise_type_object     JSON    object consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in updating exercise_type, with error
 *          status  1 - If Exercise Types updated successfully, with appropriate message
 *          status  2 - If Exercise Types not updated, with appropriate message
 * 
 * @developed by "amc"
 */
exercise_types_helper.update_exercise_type_by_id = async (exercise_type_id, exercise_types_object) => {
    try {
        let exercise_types = await Exercise_types.findOneAndUpdate({ _id: exercise_type_id }, exercise_types_object, { new: true });
        if (!exercise_types) {
            return { "status": 2, "message": "Record has not updated" };
        } else {
            return { "status": 1, "message": "Record has been updated", "ExerciseTypes": exercise_types };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while updating Exercise Types", "error": err }
    }
};

/*
 * delete_exercise_type_by_id is used to delete exercise type from database
 * 
 * @param   exercise_type_id String  _id of exercise type that need to be delete
 * 
 * @return  status  0 - If any error occur in deletion of exercise type, with error
 *          status  1 - If exercise type deleted successfully, with appropriate message
 * 
 * @developed by "amc"
 */
exercise_types_helper.delete_exercise_type_by_id = async (exercise_type_id) => {
    try {
        let resp = await Exercise_types.findOneAndRemove({ _id: exercise_type_id });
        if (!resp) {
            return { "status": 2, "message": "Exercise type not found" };
        } else {
            return { "status": 1, "message": "Exercise type deleted" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while deleting exercise type", "error": err };
    }
}

module.exports = exercise_types_helper;