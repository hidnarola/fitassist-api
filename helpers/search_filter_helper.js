var BodyPart = require("./../models/body_parts");
var body_part_helper = {};

/*
 * get_filtered_records is used to fetch all filtered data
 * 
 * @return  status 0 - If any internal error occured while fetching filtered data, with error
 *          status 1 - If filtered data found, with filtered object
 *          status 2 - If filtered not found, with appropriate message
 */
body_part_helper.get_filtered_records = async () => {
    try {
        var bodyparts = await BodyPart.find();
        if (bodyparts) {
            return { "status": 1, "message": "bodyparts found", "bodyparts": bodyparts };
        } else {
            return { "status": 2, "message": "No bodyparts available" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while finding bodyparts", "error": err }
    }
}


module.exports = body_part_helper;