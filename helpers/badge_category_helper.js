var BadgeCategory = require("./../models/badge_category");
var badge_category_helper = {};

/*
 * get_all_body_parts is used to fetch all body_parts data
 * 
 * @return  status 0 - If any internal error occured while fetching body_parts data, with error
 *          status 1 - If body_parts data found, with body_parts object
 *          status 2 - If body_parts not found, with appropriate message
 */
badge_category_helper.get_badge_categories = async () => {
    try {
        var badge_categories = await BadgeCategory.find();
        if (badge_categories) {
            return { "status": 1, "message": "badge_categories found", "badge_categories": badge_categories };
        } else {
            return { "status": 2, "message": "No badge_categories available" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while finding badge_categories", "error": err }
    }
}

/*
 * get_body_part_id is used to fetch Body Part by ID
 * 
 * @return  status 0 - If any internal error occured while fetching body part data, with error
 *          status 1 - If Body parts data found, with body part object
 *          status 2 - If Body parts data not found, with appropriate message
 */
badge_category_helper.get_badge_category_id = async (id) => {
    try {
        var badge_category = await BadgeCategory.findOne({_id:id});
        if (badge_category) {
            return { "status": 1, "message": "badge_category found", "badge_category": badge_category };
        } else {
            return { "status": 2, "message": "No badge_category available" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while finding badge_category ", "error": err }
    }
}

/*
 * insert_body_part is used to insert into bodyparts collection
 * 
 * @param   body_part_obj     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting Body part, with error
 *          status  1 - If Body part inserted, with inserted Body part document and appropriate message
 * 
 * @developed by "amc"
 */
badge_category_helper.insert_badge_category_part = async (badge_category_obj) => {
    console.log(badge_category_obj);
    let badge_category = new BadgeCategory(badge_category_obj);
    try {
        let badge_category_data = await badge_category.save();
        return { "status": 1, "message": "badge_category inserted", "badge_category": badge_category_data };
    } catch (err) {
        return { "status": 0, "message": "Error occured while inserting badge_category", "error": err };
    }
};

/*
 * update_bodypart_by_id is used to update bodypart data based on body_part_id
 * 
 * @param   body_part_id         String  _id of bodypart that need to be update
 * @param   body_part_obj     JSON    object consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in updating bodypart, with error
 *          status  1 - If bodypart updated successfully, with appropriate message
 *          status  2 - If bodypart not updated, with appropriate message
 * 
 * @developed by "amc"
 */
badge_category_helper.update_badge_category_by_id = async (badge_category_id, badge_category_obj) => {
    console.log(badge_category_obj);
    try {
        let badge_category = await BadgeCategory.findOneAndUpdate({ _id: badge_category_id }, badge_category_obj, { new: true });
        if (!badge_category) {
            return { "status": 2, "message": "Record has not updated" };
        } else {
            return { "status": 1, "message": "Record has been updated", "badge_category": badge_category };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while updating badge_category", "error": err }
    }
};

/*
 * delete_bodypart_by_id is used to delete bodypart from database
 * 
 * @param   bodypart_id String  _id of bodypart that need to be delete
 * 
 * @return  status  0 - If any error occur in deletion of bodypart, with error
 *          status  1 - If bodypart deleted successfully, with appropriate message
 * 
 * @developed by "amc"
 */
badge_category_helper.delete_badge_category_by_id = async (badge_category_id) => {
    try {
        let resp = await BadgeCategory.findOneAndRemove({ _id: badge_category_id });
        if (!resp) {
            return { "status": 2, "message": "badge category not found" };
        } else {
            return { "status": 1, "message": "badge category deleted" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while deleting badge category", "error": err };
    }
}

module.exports = badge_category_helper;