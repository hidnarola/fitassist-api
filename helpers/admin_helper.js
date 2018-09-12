var Admin = require("./../models/admin");
var admin_helper = {};

/*
 * get_admin_by_id is used to fetch admin details by id
 * @params  admin_id _id field of admin collection
 * @return  status 0 - If any internal error occured while fetching admin data, with error
 *          status 1 - If admin data found, with admin object
 *          status 2 - If admin not found, with appropriate message
 */
admin_helper.get_admin_by_id = async (admin_id) => {
    try {
        var admin = await Admin.findOne({
            "_id": {
                "$eq": admin_id
            }
        }).lean();
        if (admin) {
            return {
                "status": 1,
                "message": "Admin details found",
                "admin": admin
            };
        } else {
            return {
                "status": 2,
                "message": "Admin not found"
            };
        }
    } catch (err) {
        return {
            "status": 0,
            "message": "Error occured while finding admin",
            "error": err
        }
    }
};

/*
 * get_admin_by_email is used to fetch single admin by email address
 * @param   email   Specify email address of admin
 * @return  status  0 - If any error occur in finding admin, with error
 *          status  1 - If Admin found, with found admin document
 *          status  2 - If Admin not found, with appropriate error message
 * @developed by "amc"
 */
admin_helper.get_admin_by_email = async (email) => {
    try {
        var admin = await Admin.findOne({
            "email": email
        });
        if (admin) {
            return {
                "status": 1,
                "message": "Admin details found",
                "admin": admin
            };
        } else {
            return {
                "status": 2,
                "message": "Admin not found"
            };
        }
    } catch (err) {
        return {
            "status": 0,
            "message": "Error occured while finding admin",
            "error": err
        }
    }
};

/*
 * checkEmail is used to check email existence
 * @param   condition   Specify condition condition of admin
 * @return  status  0 - If any error occur in finding admin, with error
 *          status  1 - If Admin found, with found admin document
 *          status  2 - If Admin not found, with appropriate error message
 * @developed by "amc"
 */
admin_helper.checkEmail = async (condition) => {
    try {
        var count = await Admin.count(condition);
        if (count === 0) {
            return {
                "status": 1,
                "message": "Email exists",
                "count": count
            };
        } else {
            return {
                "status": 2,
                "message": "Email not Exist",
                "count": count
            };
        }
    } catch (err) {
        return {
            "status": 0,
            "message": "Error occured while finding admin",
            "error": err
        }
    }
};


/*
 * update_admin_by_id is used to update admin data based on admin_id
 * @param   admin_id         String  _id of admin that need to be update
 * @param   admin_object     JSON    object consist of all property that need to update
 * @return  status  0 - If any error occur in updating admin, with error
 *          status  1 - If Admin updated successfully, with appropriate message
 *          status  2 - If Admin not updated, with appropriate message
 * @developed by "amc"
 */
admin_helper.update_admin_by_id = async (admin_id, admin_object) => {
    try {
        let admin = await Admin.findOneAndUpdate({
            _id: admin_id
        }, admin_object, {
            new: true
        }).lean();
        if (!admin) {
            return {
                "status": 2,
                "message": "Record has not updated",
                "error": admin
            };
        } else {
            return {
                "status": 1,
                "message": "Record has been updated",
                "admin": admin
            };
        }
    } catch (err) {
        return {
            "status": 0,
            "message": "Error occured while updating admin",
            "error": err
        }
    }
};

module.exports = admin_helper;