var Exercise = require("./../models/exercise");
var filter_helper = {};

/*
 * get_filtered_records is used to fetch all filtered data
 * 
 * @return  status 0 - If any internal error occured while fetching filtered data, with error
 *          status 1 - If filtered data found, with filtered object
 *          status 2 - If filtered not found, with appropriate message
 */
filter_helper.get_filtered_records = async (filter_obj) => {

    console.log(filter_obj);
    // return { "status": 1, "message": "filtered data is found", "filtered_data": filter_obj };;
    try {
        var filtered_data = await Exercise.find(filter_obj.columnFilter).sort(filter_obj.columnSort).exec();
        console.log(filtered_data.length);
        if (filtered_data) {
            //console.log(filtered_data.length);
            return { "status": 1, "message": "filtered data is found","total_records":filtered_data.length, "filtered_data": filtered_data };
        } else {
            return { "status": 2, "message": "No filtered data available" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while filtering data", "error": err }
    }
}


module.exports = filter_helper;