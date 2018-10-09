var BodyPart = require("./../models/body_parts");
var body_part_helper = {};

/*
 * get_all_body_parts is used to fetch all body_parts data
 * @return  status 0 - If any internal error occured while fetching body_parts data, with error
 *          status 1 - If body_parts data found, with body_parts object
 *          status 2 - If body_parts not found, with appropriate message
 */
body_part_helper.get_all_body_parts = async (condition = {}) => {
    try {
        var bodyparts = await BodyPart.find(condition);
        if (bodyparts) {
            return {
                "status": 1,
                "message": "bodyparts found",
                "bodyparts": bodyparts
            };
        } else {
            return {
                "status": 2,
                "message": "No bodyparts available"
            };
        }
    } catch (err) {
        return {
            "status": 0,
            "message": "Error occured while finding bodyparts",
            "error": err
        }
    }
}


/*
 * get_body_part_id is used to fetch Body Part by ID
 * @return  status 0 - If any internal error occured while fetching body part data, with error
 *          status 1 - If Body parts data found, with body part object
 *          status 2 - If Body parts data not found, with appropriate message
 */
body_part_helper.get_body_part_id = async (id) => {
    try {
        var bodypart = await BodyPart.findOne({
            _id: id
        });
        if (bodypart) {
            return {
                "status": 1,
                "message": "Body part found",
                "bodypart": bodypart
            };
        } else {
            return {
                "status": 2,
                "message": "No Body part available"
            };
        }
    } catch (err) {
        return {
            "status": 0,
            "message": "Error occured while finding Body part",
            "error": err
        }
    }
}

/*
 * insert_body_part is used to insert into bodyparts collection
 * @param   body_part_obj     JSON object consist of all property that need to insert in collection
 * @return  status  0 - If any error occur in inserting Body part, with error
 *          status  1 - If Body part inserted, with inserted Body part document and appropriate message
 * @developed by "amc"
 */
body_part_helper.insert_body_part = async (body_part_obj) => {
    let bodypart = new BodyPart(body_part_obj);
    try {
        let bodypart_data = await bodypart.save();
        return {
            "status": 1,
            "message": "Bodypart inserted",
            "bodypart": bodypart_data
        };
    } catch (err) {
        return {
            "status": 0,
            "message": "Error occured while inserting Bodypart",
            "error": err
        };
    }
};

/*
 * update_bodypart_by_id is used to update bodypart data based on body_part_id
 * @param   body_part_id         String  _id of bodypart that need to be update
 * @param   body_part_obj     JSON    object consist of all property that need to update
 * @return  status  0 - If any error occur in updating bodypart, with error
 *          status  1 - If bodypart updated successfully, with appropriate message
 *          status  2 - If bodypart not updated, with appropriate message
 * @developed by "amc"
 */
body_part_helper.update_bodypart_by_id = async (body_part_id, body_part_obj) => {
    try {
        let bodypart = await BodyPart.findByIdAndUpdate({
            _id: body_part_id
        }, body_part_obj, {
                new: true
            });
        if (!bodypart) {
            return {
                "status": 2,
                "message": "Record has not updated"
            };
        } else {
            return {
                "status": 1,
                "message": "Record has been updated",
                "bodypart": bodypart
            };
        }
    } catch (err) {
        return {
            "status": 0,
            "message": "Error occured while updating bodypart",
            "error": err
        }
    }
};

/*
 * delete_bodypart_by_id is used to delete bodypart from database
 * @param   bodypart_id String  _id of bodypart that need to be delete
 * @return  status  0 - If any error occur in deletion of bodypart, with error
 *          status  1 - If bodypart deleted successfully, with appropriate message
 * @developed by "amc"
 */
body_part_helper.delete_bodypart_by_id = async (bodypart_id) => {
    try {
        let resp = await BodyPart.findOneAndRemove({
            _id: bodypart_id
        });
        if (!resp) {
            return {
                "status": 2,
                "message": "Bodypart not found"
            };
        } else {
            return {
                "status": 1,
                "message": "Bodypart deleted"
            };
        }
    } catch (err) {
        return {
            "status": 0,
            "message": "Error occured while deleting Bodypart",
            "error": err
        };
    }
}

/*
 * get_filtered_records is used to fetch all filtered data
 * @return  status 0 - If any internal error occured while fetching filtered data, with error
 *          status 1 - If filtered data found, with filtered object
 *          status 2 - If filtered not found, with appropriate message
 */
body_part_helper.get_filtered_records = async filter_obj => {
    skip = filter_obj.pageSize * filter_obj.page;
    try {
        var searched_record_count = await BodyPart.aggregate([{
            $match: filter_object.columnFilter
        }]);
        var filtered_data = await BodyPart.aggregate([{
            $match: filter_object.columnFilter
        },
        {
            $sort: filter_obj.columnSort
        },
        {
            $skip: skip
        },
        {
            $limit: filter_object.pageSize
        },

        ]);

        if (filtered_data) {
            return {
                status: 1,
                message: "filtered data is found",
                count: searched_record_count.length,
                filtered_total_pages: Math.ceil(
                    searched_record_count.length / filter_obj.pageSize
                ),
                filtered_bodypart: filtered_data
            };
        } else {
            return {
                status: 2,
                message: "No filtered data available"
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while filtering data",
            error: err
        };
    }
};
module.exports = body_part_helper;