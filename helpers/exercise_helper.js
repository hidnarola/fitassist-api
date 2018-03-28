var Exercise = require("./../models/exercise");
var exercise_helper = {};

/*
 * get_all_exercise is used to fetch all exercise data
 * 
 * @return  status 0 - If any internal error occured while fetching exercise data, with error
 *          status 1 - If exercise data found, with exercise object
 *          status 2 - If exercise not found, with appropriate message
 */
exercise_helper.get_all_exercise = async () => {
    try {
        var exercise = await Exercise.find();
        if (exercise) {
            return { "status": 1, "message": "Exercise found", "exercises": exercise };
        } else {
            return { "status": 2, "message": "No exercise available" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while finding exercise", "error": err }
    }
}


/*
 * get_exercise_id is used to fetch exercise by ID
 * 
 * @return  status 0 - If any internal error occured while fetching exercise data, with error
 *          status 1 - If exercise data found, with exercise object
 *          status 2 - If exercise not found, with appropriate message
 */
exercise_helper.get_exercise_id = async (id) => {
    try {
        var exercise = await Exercise.findOne({_id:id});
        if (exercise) {
            return { "status": 1, "message": "exercise found", "exercise": exercise };
        } else {
            return { "status": 2, "message": "No exercise available" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while finding exercise", "error": err }
    }
}

/*
 * insert_exercise is used to insert into exercise collection
 * 
 * @param   exercise     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting exercise, with error
 *          status  1 - If exercise inserted, with inserted exercise document and appropriate message
 * 
 * @developed by "amc"
 */
exercise_helper.insert_exercise = async (exercise_object) => {
    console.log(exercise_object);
    let exercise = new Exercise(exercise_object);
    try {
        let exercise_data = await exercise.save();
        return { "status": 1, "message": "Exercise inserted", "exercise": exercise_data };
    } catch (err) {
        return { "status": 0, "message": "Error occured while inserting Exercise", "error": err };
    }
};

/*
 * update_exercise_by_id is used to update exercise data based on exercise_id
 * 
 * @param   exercise_id         String  _id of exercise that need to be update
 * @param   exercise_object     JSON    object consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in updating exercise, with error
 *          status  1 - If Exercise updated successfully, with appropriate message
 *          status  2 - If Exercise not updated, with appropriate message
 * 
 * @developed by "amc"
 */
exercise_helper.update_exercise_by_id = async (exercise_id, exercise_object) => {
    try {
        let exercise = await Exercise.findOneAndUpdate({ _id: exercise_id }, exercise_object, { new: true });
        if (!exercise) {
            return { "status": 2, "message": "Record has not updated" };
        } else {
            return { "status": 1, "message": "Record has been updated", "exercise": exercise };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while updating exercise", "error": err }
    }
};

/*
 * delete_exercise_by_id is used to delete exercise from database
 * 
 * @param   exercise_id String  _id of exercise that need to be delete
 * 
 * @return  status  0 - If any error occur in deletion of exercise, with error
 *          status  1 - If exercise deleted successfully, with appropriate message
 * 
 * @developed by "amc"
 */
exercise_helper.delete_exercise_by_id = async (exercise_id) => {
    try {
        let resp = await Exercise.findOneAndRemove({ _id: exercise_id });
        if (!resp) {
            return { "status": 2, "message": "Exercise not found" };
        } else {
            return { "status": 1, "message": "Exercise deleted" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while deleting exercise", "error": err };
    }
}

module.exports = exercise_helper;