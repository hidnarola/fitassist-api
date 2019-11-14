var Follows = require("./../models/follows");
var follow_helper = {};

follow_helper.startFollowing = async data => {
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

follow_helper.stopFollowing = async _id => {
  try {
    let resource = await Follows.findOneAndRemove({ _id });
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
    let resource = await Follows.findOne({ followerId, followingId });
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

follow_helper.getFollowings = async followerId => {
  try {
    let cond = [
      {
        $match: {
          followerId
        }
      },
      {
        $lookup: {
          from: "users",
          foreignField: "authUserId",
          localField: "followingId",
          as: "user_details"
        }
      },
      {
        $unwind: {
          path: "$user_details"
        }
      }
    ];
    let resource = await Follows.aggregate(cond);
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

follow_helper.getFollowers = async followingId => {
  try {
    let cond = [
      {
        $match: {
          followingId
        }
      },
      {
        $lookup: {
          from: "users",
          foreignField: "authUserId",
          localField: "followerId",
          as: "user_details"
        }
      },
      {
        $unwind: {
          path: "$user_details"
        }
      }
    ];
    let resource = await Follows.aggregate(cond);
    if (resource && resource.length > 0) {
      let responseData = {
        status: 1,
        message: "Followers",
        data: resource
      };
      return responseData;
    } else {
      let responseData = {
        status: 1,
        message: "No Followers",
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

follow_helper.countFollowers = async userId => {
  try {
    let resource = await Follows.count({ followingId: userId });
    return resource;
  } catch (error) {
    return 0;
  }
};

follow_helper.countFollowings = async userId => {
  try {
    let resource = await Follows.count({ followerId: userId });
    return resource;
  } catch (error) {
    return 0;
  }
};

follow_helper.following_users_Ids = async followerId => {
  try {
    let user_Ids = await Follows.aggregate([
      {
        $match: {
          followerId: followerId
        }
      },
      {
        $group: {
          _id: "$followingId"
        }
      },
      {
        $project: {
          _id: 0,
          followingIds: "$_id"
        }
      }
    ]);
    let followIDArray = [];
    user_Ids.forEach(item => {
      followIDArray.push(item.followingIds);
    });
    if (followIDArray.length > 0) {
      return {
        status: 1,
        message: "following userIds found",
        followingIds: followIDArray
      };
    } else {
      return {
        status: 2,
        message: "following userIds Not found",
        followingIds: followIDArray
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while following user data",
      error: err
    };
  }
};

module.exports = follow_helper;
