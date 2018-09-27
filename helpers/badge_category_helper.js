var BadgeCategory = require("./../models/badge_category");
var badge_category_helper = {};

/*
 * get_badge_categories is used to fetch all badge_categories data
 * 
 * @return  status 0 - If any internal error occured while fetching badge_categories data, with error
 *          status 1 - If badge_categories data found, with badge_categories object
 *          status 2 - If badge_categories not found, with appropriate message
 */
badge_category_helper.get_badge_categories = async () => {
    try {
        var badge_categories = await BadgeCategory.find();
        if (badge_categories) {
            return {
                "status": 1,
                "message": "badge_categories found",
                "badge_categories": badge_categories
            };
        } else {
            return {
                "status": 2,
                "message": "No badge_categories available"
            };
        }
    } catch (err) {
        return {
            "status": 0,
            "message": "Error occured while finding badge_categories",
            "error": err
        }
    }
}

/*
 * get_badge_category_id is used to fetch badge_category by ID
 * 
 * @return  status 0 - If any internal error occured while fetching badge_category data, with error
 *          status 1 - If badge_category data found, with badge_category object
 *          status 2 - If badge_category data not found, with appropriate message
 */
badge_category_helper.get_badge_category_id = async (id) => {
    try {
        var badge_category = await BadgeCategory.findOne({
            _id: id
        });
        if (badge_category) {
            return {
                "status": 1,
                "message": "badge_category found",
                "badge_category": badge_category
            };
        } else {
            return {
                "status": 2,
                "message": "No badge_category available"
            };
        }
    } catch (err) {
        return {
            "status": 0,
            "message": "Error occured while finding badge_category ",
            "error": err
        }
    }
}

/*
 * insert_badge_category_part is used to insert into badge_category collection
 * 
 * @param   badge_category_obj     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting badge_category, with error
 *          status  1 - If badge_category inserted, with inserted badge_category document and appropriate message
 * 
 * @developed by "amc"
 */
badge_category_helper.insert_badge_category_part = async (badge_category_obj) => {
    let badge_category = new BadgeCategory(badge_category_obj);
    try {
        let badge_category_data = await badge_category.save();
        return {
            "status": 1,
            "message": "badge_category inserted",
            "badge_category": badge_category_data
        };
    } catch (err) {
        return {
            "status": 0,
            "message": "Error occured while inserting badge_category",
            "error": err
        };
    }
};

/*
 * update_badge_category_by_id is used to update badge_category data based on badge_category_id
 * 
 * @param   badge_category_id         String  _id of badge_category that need to be update
 * @param   badge_category_obj     JSON    object consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in updating badge_category, with error
 *          status  1 - If badge_category updated successfully, with appropriate message
 *          status  2 - If badge_category not updated, with appropriate message
 * 
 * @developed by "amc"
 */
badge_category_helper.update_badge_category_by_id = async (badge_category_id, badge_category_obj) => {
    try {
        let badge_category = await BadgeCategory.findOneAndUpdate({
            _id: badge_category_id
        }, badge_category_obj, {
            new: true
        });
        if (!badge_category) {
            return {
                "status": 2,
                "message": "Record has not updated"
            };
        } else {
            return {
                "status": 1,
                "message": "Record has been updated",
                "badge_category": badge_category
            };
        }
    } catch (err) {
        return {
            "status": 0,
            "message": "Error occured while updating badge_category",
            "error": err
        }
    }
};

/*
 * delete_badge_category_by_id is used to delete badge_category from database
 * 
 * @param   badge_category_id String  _id of badge_category that need to be delete
 * 
 * @return  status  0 - If any error occur in deletion of badge_category, with error
 *          status  1 - If badge_category deleted successfully, with appropriate message
 * 
 * @developed by "amc"
 */
badge_category_helper.delete_badge_category_by_id = async (badge_category_id) => {
    try {
        let resp = await BadgeCategory.findOneAndUpdate({
            _id: badge_category_id
        }, {
            isDeleted: 1
        });
        if (!resp) {
            return {
                "status": 2,
                "message": "badge category not found"
            };
        } else {
            return {
                "status": 1,
                "message": "badge category deleted"
            };
        }
    } catch (err) {
        return {
            "status": 0,
            "message": "Error occured while deleting badge category",
            "error": err
        };
    }
}

/*
 * get_filtered_records is used to fetch all filtered data
 * 
 * @return  status 0 - If any internal error occured while fetching filtered data, with error
 *          status 1 - If filtered data found, with filtered object
 *          status 2 - If filtered not found, with appropriate message
 */
badge_category_helper.get_filtered_records = async filter_obj => {
    skip = filter_obj.pageSize * filter_obj.page;
    try {
        var searched_record_count = await BadgeCategory.aggregate([{
            $match: filter_object.columnFilter
        }]);
        var filtered_data = await BadgeCategory.aggregate([{
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
                filtered_badge_categories: filtered_data
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
module.exports = badge_category_helper;