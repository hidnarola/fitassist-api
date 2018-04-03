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
  queryObj={};
  if(filter_obj.columnFilter && filter_obj.columnFilter.length>0)
  {
      queryObj['$and']=filter_obj.columnFilter;
    // queryObj.push({$and:filter_obj.columnFilter})
  }

  
    // return { "status": 1, "message": "filtered data is found", "filtered_data": filter_obj };;
    try {
        var filtered_data = await Exercise.find(queryObj).limit(filter_obj.pageSize).skip(filter_obj.pageSize*filter_obj.page).exec();

        if (filtered_data) {
            //console.log(filtered_data.length);
            return { "status": 1, "message": "filtered data is found","filtered_total_pages":Math.ceil(filtered_data.length/filter_obj.pageSize), "filtered_exercises": filtered_data };
        } else {
            return { "status": 2, "message": "No filtered data available" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while filtering data", "error": err }
    }
}


module.exports = filter_helper;