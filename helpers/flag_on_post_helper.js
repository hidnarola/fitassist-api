var Flags = require("./../models/flags");
var _ = require('underscore');
var flag_on_post_helper = {};

/*
 * get_all_flags is used to get all flags collection
 * @return  status  0 - If any error occur in fetching flag, with error
 *          status  1 - If flag found, with found flag document and appropriate message
 * @developed by "amc"
 */
flag_on_post_helper.get_all_flags = async () => {
    try {
        let flag_data = await Flags.aggregate([{
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "authUserId",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $group: {
                    _id: "$postId",
                    "user": {
                        $push: {
                            "type": "$type",
                            "comment": "$comment",
                            "createdAt": "$createdAt",
                            "firstName": "$user.firstName",
                            "lastName": "$user.lastName",
                            "username": "$user.username",
                            "avatar": "$user.avatar"
                        }
                    },
                    "postId": {
                        $first: "$postId"
                    },
                },

            }
        ]);

        _.map(flag_data, function (o) {
            o.totalFlags = o.user.length;
            o.types = _.uniq(_.pluck(o.user, 'type'));
            // delete o.user;
        });

        return {
            status: 1,
            message: "Flag Found",
            flags: flag_data
        };
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while fetching Flags",
            error: err
        };
    }
};

/*
 * flag_on_post is used to report on post into user_posts collection
 * @param   flagObject     JSON object consist of all property that need to insert in user_posts collection
 * @return  status  0 - If any error occur in inserting flag, with error
 *          status  1 - If flag inserted, with inserted flag document and appropriate message
 * @developed by "amc"
 */
flag_on_post_helper.flag_on_post = async (flagObject) => {
    let flag = new Flags(flagObject);
    try {
        let flag_data = await flag.save();
        return {
            "status": 1,
            "message": "Flag inserted",
            "flag": flag_data
        };
    } catch (err) {
        return {
            "status": 0,
            "message": "Error occured while inserting Flag",
            "error": err
        };
    }
};

/*
 * delete_flag_by_id is used to delete flag from database
 * @param   flag_id String  _id of flag that need to be delete
 * @return  status  0 - If any error occur in deletion of flag, with error
 *          status  1 - If flag deleted successfully, with appropriate message
 * @developed by "amc"
 */

flag_on_post_helper.delete_flag_by_id = async (flag_id) => {
    try {
        let resp = await BodyPart.findOneAndRemove({
            _id: flag_id
        });
        if (!resp) {
            return {
                "status": 2,
                "message": "Flag not found"
            };
        } else {
            return {
                "status": 1,
                "message": "Flag deleted"
            };
        }
    } catch (err) {
        return {
            "status": 0,
            "message": "Error occured while deleting Flag",
            "error": err
        };
    }
}
module.exports = flag_on_post_helper;