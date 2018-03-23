var Measurement = require("./../models/body_measurements");
var measurement_helper = {};

/*
 * insert_measurement is used to insert into user collection
 * 
 * @param   user_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting faculty, with error
 *          status  1 - If faculty inserted, with inserted faculty's document and appropriate message
 * 
 * @developed by "ar"
 */
measurement_helper.insert_measurement = async (measurement_object) => {
    let measurement = new Measurement(measurement_object)
    try{
        let measurement_data = await measurement.save();
        return { "status": 1, "message": "User's measurement inserted", "measurement": measurement_data };
    } catch(err){
        return { "status": 0, "message":"Error occured while inserting user's measurement","error": err };
    }
};

module.exports = measurement_helper;