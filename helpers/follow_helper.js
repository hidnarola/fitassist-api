var Follows = require("./../models/follows");
var follow_helper = {};

follow_helper.startFollowing = async (data) => {
    try {
        let newFollowing = new Follows(data);
        let resource = await newFollowing.save();
        if (resource) {
            let responseData = {
                status: 1,
                message: "Success",
                data: resource
            };
            return responseData;
        } else {
            let responseData = {
                status: 0,
                message: "Something went wrong! please try again later.",
                error: ["Something went wrong! please try again later."]
            };
            return responseData;
        }
    } catch (error) {
        let responseData = {
            status: 0,
            message: "Something went wrong! please try again later.",
            error: ["Something went wrong! please try again later."]
        };
        return responseData;
    }
};

follow_helper.stopFollowing = async (_id) => {
    try {
        let resource = await Follows.findOneAndRemove({_id});
        if (resource) {
            let responseData = {
                status: 1,
                message: "Success",
                data: resource
            };
            return responseData;
        } else {
            let responseData = {
                status: 0,
                message: "Something went wrong! please try again later.",
                error: ["Something went wrong! please try again later."]
            };
            return responseData;
        }
    } catch (error) {
        let responseData = {
            status: 0,
            message: "Something went wrong! please try again later.",
            error: ["Something went wrong! please try again later."]
        };
        return responseData;
    }
};

follow_helper.getFollowing = async (followerId, followingId) => {
    try {
        let resource = await Follows.findOne({followerId, followingId});
        if (resource) {
            let responseData = {
                status: 1,
                message: "Following",
                data: resource
            };
            return responseData;
        } else {
            let responseData = {
                status: 1,
                message: "Not following",
                data: null
            };
            return responseData;
        }
    } catch (error) {
        let responseData = {
            status: 0,
            message: "Something went wrong! please try again later.",
            error: ["Something went wrong! please try again later."]
        };
        return responseData;
    }
};

follow_helper.getFollowings = async (followerId) => {
    try {
        let resource = await Follows.find({followerId});
        if (resource && resource.length > 0) {
            let responseData = {
                status: 1,
                message: "Following",
                data: resource
            };
            return responseData;
        } else {
            let responseData = {
                status: 1,
                message: "Not following",
                data: []
            };
            return responseData;
        }
    } catch (error) {
        let responseData = {
            status: 0,
            message: "Something went wrong! please try again later.",
            error: ["Something went wrong! please try again later."]
        };
        return responseData;
    }
};

follow_helper.countFollowers = async (userId) => {
    try {
        let resource = await Follows.count({followingId: userId});
        return resource;
    } catch (error) {
        return 0;
    }
};

follow_helper.countFollowings = async (userId) => {
    try {
        let resource = await Follows.count({followerId: userId});
        return resource;
    } catch (error) {
        return 0;
    }
};

module.exports = follow_helper;