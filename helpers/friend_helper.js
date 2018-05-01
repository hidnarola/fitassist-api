var Friends = require("./../models/friends");
var Users = require("./../models/users");
var friend_helper = {};

/*
 * get_friends is used to fetch all friends data
 * 
 * @return  status 0 - If any internal error occured while fetching friends data, with error
 *          status 1 - If friends data found, with friends object
 *          status 2 - If friends not found, with appropriate message
 */
friend_helper.get_friends = async id => {
  try {
    var friends = await Friends.aggregate([
      {
        $match: id
      },
      {
        $unwind: "$friendId"
      },
      {
        $lookup: {
          from: "users",
          localField: "friendId",
          foreignField: "authUserId",
          as: "friends"
        }
      },
      {
        $unwind: { path: "$friends" }
      },
      {
        $group: {
          _id: "$userId",
          friends: {
            $addToSet: {
              username: "$friends.username",
              authUserId: "$friends.authUserId",
              _id: "$_id",
              firstName: "$friends.firstName",
              avatar: "$friends.avatar"
            }
          }
        }
      }
    ]);
    if (friends && friends.length > 0) {
      return {
        status: 1,
        message: "friends found",
        friends: friends[0].friends
      };
    } else {
      return { status: 2, message: "No friends available", friends: [] };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding friends",
      error: err
    };
  }
};

/*
 * get_friends is used to fetch all friends data
 * 
 * @return  status 0 - If any internal error occured while fetching friends data, with error
 *          status 1 - If friends data found, with friends object
 *          status 2 - If friends not found, with appropriate message
 */
friend_helper.get_friend_by_username = async username => {
  try {
    var friends = await Users.aggregate([      
      {
        $project:{
          gender:true,
          username:true,
          avatar:true,
          email:true,
          firstName:true, 
          authUserId:true         
        }
      },
      {
        $match:username
      },
      {
        $lookup:{
          from:"friends",
          localField:"authUserId",
          foreignField:"userId",
          as:"friendList"
        }
      },
      {
        $unwind:"$friendList"
      },
      {
        $group:{
          _id:"_id",
          friendList:{$addToSet:"$friendList"}
        }
      },
      {
        $project:{
          friendList:true
        }
      }
      
    ]);
    console.log(friends);
    if (friends || friends.length > 0) {
      return {
        status: 1,
        message: "username found",
        friends: friends
      };
    } else {
      return { status: 2, message: "No username available", friends: [] };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding friends",
      error: err
    };
  }
};

/*
 * send_friend_request is used to insert friends collection
 * 
 * @param   friend_obj     JSON object consist of all property that need to insert in collection
 * 
 * @return  status  0 - If any error occur in inserting friend, with error
 *          status  1 - If friend inserted, with inserted friend document and appropriate message
 * 
 * @developed by "amc"
 */
friend_helper.send_friend_request = async friend_obj => {
  console.log(friend_obj);
  let friend = new Friends(friend_obj);
  try {
    let badge_task_data = await friend.save();
    return {
      status: 1,
      message: "friend inserted",
      friend: badge_task_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting friend",
      error: err
    };
  }
};

/*
 * approve_friend is used to approve friend 
 * 
 * @param   id         id of friend that need to be update
 * @param   friend_obj     JSON    object consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in approving friend request, with error
 *          status  1 - If approving friend request updated successfully, with appropriate message
 *          status  2 - If approving friend request not updated, with appropriate message
 * 
 * @developed by "amc"
 */
friend_helper.approve_friend = async (id, friend_obj) => {
  try {
    let friend = await Friends.findOneAndUpdate(id, friend_obj, { new: true });
    if (!friend) {
      return { status: 2, message: "Friend request not found" };
    } else {
      return {
        status: 1,
        message: "Friend request approved",
        friend: friend
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while friend request approve",
      error: err
    };
  }
};

/*
 * reject_friend is used to reject friend requets 
 * 
 * @param   id         id of friend that need to be update
 * @param   friend_obj     JSON    object consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in reject friend request, with error
 *          status  1 - If reject friend request updated successfully, with appropriate message
 *          status  2 - If reject friend request not updated, with appropriate message
 * 
 * @developed by "amc"
 */
friend_helper.reject_friend = async id => {
  try {
    let friend = await Friends.remove(id);

    if (!friend && friend.n === 0) {
      return { status: 2, message: "Friend request not found" };
    } else {
      return {
        status: 1,
        message: "Friend request rejected"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while friend request approve",
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
friend_helper.get_filtered_records = async filter_obj => {
  console.log(filter_obj);
  skip = filter_obj.pageSize * filter_obj.page;
  try {
    var searched_record_count = await Friends.aggregate([
      {
        $match: filter_object.columnFilter
      }
    ]);
    var filtered_data = await Friends.aggregate([
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
        filtered_badge_tasks: filtered_data
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
module.exports = friend_helper;
