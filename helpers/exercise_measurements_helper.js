var ExerciseMeasurements = require("./../models/exercise_measurements");
var _ = require("underscore");
var exercise_measurements_helper = {};

/*
 * get_all_measurements is used to fetch all measurements data
 * 
 * @return  status 0 - If any internal error occured while fetching measurements data, with error
 *          status 1 - If measurements data found, with measurements object
 *          status 2 - If measurements not found, with appropriate message
 */
exercise_measurements_helper.get_all_measurements = async (id = {}) => {
  try {
    var exercise_measurements = await ExerciseMeasurements.find(id);
    if (exercise_measurements && exercise_measurements.length > 0) {
      return {
        status: 1,
        message: "Exercise measurements found",
        measurements: exercise_measurements
      };
    } else {
      return {
        status: 2,
        message: "No Exercise measurements available",
        measurements: []
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding Exercise measurements",
      error: err
    };
  }
};

/*
 * insert_exercise_measurements is used to insert measurements collection
 * @param   exercise_measurements_obj     JSON object consist of all property that need to insert in collection
 * @return  status  0 - If any error occur in inserting exercise measurements, with error
 *          status  1 - If exercise measurements inserted, with inserted exercise measurements document and appropriate message
 * @developed by "amc"
 */
exercise_measurements_helper.insert_exercise_measurements = async exercise_measurements_obj => {
  try {
    // let exercise_measurements = new ExerciseMeasurements(
    //   exercise_measurements_obj
    // );
    let exercise_measurements_data = await ExerciseMeasurements.insertMany(
      exercise_measurements_obj
    );
    return {
      status: 1,
      message: "Exercise measurements added",
      measurement: exercise_measurements_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while adding Exercise measurements",
      error: err
    };
  }
};

module.exports = exercise_measurements_helper;
