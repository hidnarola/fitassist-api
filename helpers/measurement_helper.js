var Measurement = require("./../models/body_measurements");
var measurement_helper = {};

/*
 * get_all_measurement is used to fetch all measurement data
 * 
 * @return  status 0 - If any internal error occured while fetching measurement data, with error
 *          status 1 - If measurement data found, with measurement object
 *          status 2 - If measurement not found, with appropriate message
 */
measurement_helper.get_all_measurement = async () => {
  try {
    var measurement = await Measurement.find();
    if (measurement) {
      return {
        status: 1,
        message: "Measurement found",
        measurements: measurement
      };
    } else {
      return { status: 2, message: "No measurement available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding measurement",
      error: err
    };
  }
};

/*
 * get_body_measurement_id is used to fetch bodymeasurement by ID
 * 
 * @return  status 0 - If any internal error occured while fetching bodymeasurement data, with error
 *          status 1 - If bodymeasurement data found, with bodymeasurement object
 *          status 2 - If bodymeasurement not found, with appropriate message
 */
measurement_helper.get_body_measurement_id = async id => {
  try {
    var measurement = await Measurement.findOne(id);
    if (measurement) {
      return {
        status: 1,
        message: "measurement found",
        measurement: measurement
      };
    } else {
      return { status: 2, message: "No measurement available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding measurement",
      error: err
    };
  }
};

/*
 * get_body_measurement_by_userid is used to fetch bodymeasurement by userID
 * 
 * @return  status 0 - If any internal error occured while fetching bodymeasurement data, with error
 *          status 1 - If bodymeasurement data found, with bodymeasurement object
 *          status 2 - If bodymeasurement not found, with appropriate message
 */
measurement_helper.get_body_measurement_by_userid = async id => {
  try {
    var measurement = await Measurement.find(id);
    if (measurement) {
      return {
        status: 1,
        message: "measurement found",
        measurements: measurement
      };
    } else {
      return { status: 2, message: "No measurement available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding measurement",
      error: err
    };
  }
};
/*
 * get_logdata_by_userid is used to fetch logdata by userID
 * 
 * @return  status 0 - If any internal error occured while fetching logdata data, with error
 *          status 1 - If logdata data found, with logdata object
 *          status 2 - If logdata not found, with appropriate message
 */
measurement_helper.get_logdata_by_userid = async id => {
  try {
    var logdata = await Measurement.find(id);
    //        var logdata = await Measurement.aggregate(id);
    if (logdata) {
      return { status: 1, message: "logdata found", logdates: logdata };
    } else {
      return { status: 2, message: "No logdata available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding logdata",
      error: err
    };
  }
};

/*
 * insert_body_measurement is used to insert into body_measurement collection
 * 
 * @param   measurement_object     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting body measurement, with error
 *          status  1 - If Body measurement inserted, with inserted body_measurement's document and appropriate message
 * 
 * @developed by "amc"
 */
measurement_helper.insert_body_measurement = async measurement_object => {
  let measurement = new Measurement(measurement_object);
  try {
    let measurement_data = await measurement.save();
    return {
      status: 1,
      message: "measurement inserted",
      measurement: measurement_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting measurement",
      error: err
    };
  }
};

/*
 * update_body_measurement is used to update body_measurement data based on body_measurement_id
 * 
 * @param   body_measurement_id  String _id of body_measurement that need to be update
 * @param   measurement_obj  JSON  object consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in updating body_measurement, with error
 *          status  1 - If Body_measurement updated successfully, with appropriate message
 *          status  2 - If Body_measurement Types not updated, with appropriate message
 * 
 * @developed by "amc"
 */
measurement_helper.update_body_measurement = async (
  body_measurement_id,
  measurement_obj
) => {
  try {
    let measurement = await Measurement.findOneAndUpdate(
      { _id: body_measurement_id },
      measurement_obj,
      { new: true }
    );
    if (!measurement) {
      return { status: 2, message: "Record has not updated" };
    } else {
      return {
        status: 1,
        message: "Record has been updated",
        measurement: measurement
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating Exercise Types",
      error: err
    };
  }
};

/*
 * delete_measurement_by_id is used to delete body_measurement data based on body_measurement_id
 * 
 * @param   body_measurement_id  String _id of body_measurement that need to be delete
 * 
 * @return  status  0 - If any error occur in updating body_measurement, with error
 *          status  1 - If Body_measurement deleted successfully, with appropriate message
 *          status  2 - If Body_measurement Types not deleted, with appropriate message
 * 
 * @developed by "amc"
 */
measurement_helper.delete_measurement_by_id = async body_measurement_id => {
  try {
    let resp = await Measurement.findOneAndRemove({ _id: body_measurement_id });
    if (!resp) {
      return { status: 2, message: "Measurement not found" };
    } else {
      return { status: 1, message: "Measurement deleted" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while deleting Measurement",
      error: err
    };
  }
};

/*
 * get_filtered_records is used to fetch all filtered data
 * 
 * @return  status 0 - If any internal error occured while fetching filtered data, with error
 *          status 1 - If filtered data found, with filtered object
 *          status 2 - If filtered not found, with appropriate message
 */
measurement_helper.get_filtered_records = async filter_obj => {
  skip = filter_obj.pageSize * filter_obj.page;
  try {
    var searched_record_count = await Measurement.aggregate([
      {
        $match: filter_object.columnFilter
      }
    ]);

    var filtered_data = await Measurement.aggregate([
      {
        $match: filter_object.columnFilter
      },
      { $skip: skip },
      { $limit: filter_object.pageSize },
      { $sort: filter_obj.columnSort }
    ]);

    if (filtered_data) {
      return {
        status: 1,
        message: "filtered data is found",
        count: searched_record_count.length,
        filtered_total_pages: Math.ceil(
          searched_record_count.length / filter_obj.pageSize
        ),
        filtered_measurements: filtered_data
      };
    } else {
      return { status: 2, message: "No filtered data available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while filtering data",
      error: err
    };
  }
};

module.exports = measurement_helper;
