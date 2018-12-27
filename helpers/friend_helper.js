var Friends = require("./../models/friends");
var Users = require("./../models/users");
var _ = require("underscore");
var friend_helper = {};

/*
 * get_friends is used to fetch all friends data
 * @return  status 0 - If any internal error occured while fetching friends data, with error
 *          status 1 - If friends data found, with friends object
 *          status 2 - If friends not found, with appropriate message
 */
friend_helper.get_friends = async id => {
  try {
    var friends = await Friends.aggregate([{
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
      $unwind: {
        path: "$friends"
      }
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
        friends: friends[0].friendListDetails
      };
    } else {
      return {
        status: 2,
        message: "No friends available",
        friends: []
      };
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
friend_helper.get_friend_by_username = async (username, statusType, skip = false, limit = false, sort = false) => {
  try {
    let aggregate;
    if (statusType == 2) {
      aggregate = [{
        $match: username
      },
      {
        $lookup: {
          from: "friends",
          localField: "authUserId",
          foreignField: "userId",
          as: "friendList"
        }
      },
      {
        $unwind: {
          path: "$friendList",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          authUserId: 1,
          friendList: {
            $mergeObjects: [
              "$friendList",
              {
                fetch_id: "$friendList.friendId"
              }
            ]
          }
        }
      },
      {
        $lookup: {
          from: "friends",
          localField: "authUserId",
          foreignField: "friendId",
          as: "friendList2"
        }
      },
      {
        $unwind: {
          path: "$friendList2",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          authUserId: 1,
          friendList: 1,
          friendList2: {
            $mergeObjects: [
              "$friendList2",
              {
                fetch_id: "$friendList2.userId"
              }
            ]
          }
        }
      },
      {
        $group: {
          _id: "$_id",
          authUserId: {
            $first: "$authUserId"
          },
          friendList: {
            $addToSet: "$friendList"
          },
          friendList2: {
            $addToSet: "$friendList2"
          }
        }
      },
      {
        $addFields: {
          friendIds: {
            $concatArrays: ["$friendList", "$friendList2"]
          }
        }
      },
      {
        $unwind: "$friendIds"
      },
      {
        $match: {
          "friendIds.status": 2
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "friendIds.fetch_id",
          foreignField: "authUserId",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          users: {
            $mergeObjects: ["$user", {
              friendshipId: "$friendIds._id"
            }]
          }
        }
      },
      {
        $lookup: {
          from: "friends",
          localField: "users.authUserId",
          foreignField: "friendId",
          as: "rightside"
        }
      },
      {
        $lookup: {
          from: "friends",
          localField: "users.authUserId",
          foreignField: "userId",
          as: "leftside"
        }
      },
      {
        $project: {
          users: {
            $mergeObjects: [
              "$users",
              {
                totalFriends: {
                  $concatArrays: ["$leftside", "$rightside"]
                }
              }
            ]
          }
        }
      },
      {
        $group: {
          _id: "authUserId",
          user: {
            $push: "$users"
          }
        }
      }
      ];
      if (skip && limit) {
        aggregate.push({
          $unwind: "$user"
        },
          skip,
          limit, {
            $group: {
              _id: "",
              user: {
                $addToSet: "$$ROOT.user"
              }
            }
          })
      }
      aggregate.push({
        $project: {
          "user._id": 1,
          "user.authUserId": 1,
          "user.firstName": 1,
          "user.avatar": 1,
          "user.username": 1,
          "user.lastName": 1,
          "user.friendshipId": 1,
          "user.totalFriends": 1,
        }
      },
        {
          $unwind: "$user"
        },
        {
          '$lookup': {
            from: 'user_settings',
            localField: 'user.authUserId',
            foreignField: 'userId',
            as: 'userSettings'
          }
        },
        {
          $unwind: "$userSettings"
        },
        {
          "$addFields": { "user.userSettings": "$userSettings" }
        },
        {
          $group: {
            _id: "",
            user: {
              $addToSet: "$$ROOT.user"
            }
          }
        },
        {
          $project: {
            "user._id": 1,
            "user.authUserId": 1,
            "user.firstName": 1,
            "user.avatar": 1,
            "user.username": 1,
            "user.lastName": 1,
            "user.friendshipId": 1,
            "user.totalFriends": 1,
            "user.userSettings": 1
          }
        }
      );
    } else {
      aggregate = [{
        $match: username
      },
      {
        $lookup: {
          from: "friends",
          localField: "authUserId",
          foreignField: "friendId",
          as: "friendList"
        }
      },
      {
        $unwind: "$friendList"
      },
      {
        $match: {
          "friendList.status": 1
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "friendList.userId",
          foreignField: "authUserId",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          users: {
            $mergeObjects: ["$user", {
              friendshipId: "$friendList._id"
            }]
          }
        }
      },
      {
        $lookup: {
          from: "friends",
          localField: "users.authUserId",
          foreignField: "friendId",
          as: "rightside"
        }
      },
      {
        $lookup: {
          from: "friends",
          localField: "users.authUserId",
          foreignField: "userId",
          as: "leftside"
        }
      },
      {
        $project: {
          users: {
            $mergeObjects: [
              "$users",
              {
                totalFriends: {
                  $concatArrays: ["$leftside", "$rightside"]
                }
              }
            ]
          }
        }
      },
      {
        $group: {
          _id: "authUserId",
          user: {
            $push: "$users"
          }
        }
      }
      ];

      if (skip && limit) {
        aggregate.push({
          $unwind: "$user"
        },
          skip,
          limit, {
            $group: {
              _id: "",
              user: {
                $addToSet: "$$ROOT.user"
              }
            }
          })
      }
      aggregate.push({
        $project: {
          "user._id": 1,
          "user.authUserId": 1,
          "user.firstName": 1,
          "user.avatar": 1,
          "user.username": 1,
          "user.lastName": 1,
          "user.friendshipId": 1,
          "user.totalFriends": 1,
        }
      },
        {
          $unwind: "$user"
        },
        {
          '$lookup': {
            from: 'user_settings',
            localField: 'user.authUserId',
            foreignField: 'userId',
            as: 'userSettings'
          }
        },
        {
          $unwind: "$userSettings"
        },
        {
          "$addFields": { "user.userSettings": "$userSettings" }
        },
        {
          $group: {
            _id: "",
            user: {
              $addToSet: "$$ROOT.user"
            }
          }
        },
        {
          $project: {
            "user._id": 1,
            "user.authUserId": 1,
            "user.firstName": 1,
            "user.avatar": 1,
            "user.username": 1,
            "user.lastName": 1,
            "user.friendshipId": 1,
            "user.totalFriends": 1,
            "user.userSettings": 1
          }
        }
      );
    }

    let friends = await Users.aggregate(aggregate);
    if (friends && friends.length > 0) {
      _.each(friends[0].user, (friend, index) => {
        var total_friends = friend.totalFriends;
        var cnt = 0;
        _.each(total_friends, (frd, i) => {
          if (frd.status == 2) {
            cnt++;
          }
        });
        friend.friendsCount = cnt;
        delete friend.totalFriends;
      });
      return {
        status: 1,
        message: "friends found",
        friends: friends[0].user ? friends[0].user : []
      };
    } else {
      return {
        status: 1,
        message: "No friend available",
        friends: []
      };
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
 * @param   friend_obj     JSON object consist of all property that need to insert in collection
 * @return  status  0 - If any error occur in inserting friend, with error
 *          status  1 - If friend inserted, with inserted friend document and appropriate message
 * @developed by "amc"
 */
friend_helper.send_friend_request = async friend_obj => {
  let friend = new Friends(friend_obj);
  try {
    let badge_task_data = await friend.save();
    return {
      status: 1,
      message: "friend request sent",
      friend: badge_task_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while sending friend request",
      error: err
    };
  }
};

/*
 * approve_friend is used to approve friend 
 * @param   id         id of friend that need to be update
 * @param   friend_obj     JSON    object consist of all property that need to update
 * @return  status  0 - If any error occur in approving friend request, with error
 *          status  1 - If approving friend request updated successfully, with appropriate message
 *          status  2 - If approving friend request not updated, with appropriate message
 * @developed by "amc"
 */
friend_helper.approve_friend = async (id, friend_obj) => {
  try {
    let friend = await Friends.findOneAndUpdate(id, friend_obj, {
      new: true
    });
    if (!friend) {
      return {
        status: 2,
        message: "Friend request not found"
      };
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
 * @param   id         id of friend that need to be update
 * @param   friend_obj     JSON    object consist of all property that need to update
 * @return  status  0 - If any error occur in reject friend request, with error
 *          status  1 - If reject friend request updated successfully, with appropriate message
 *          status  2 - If reject friend request not updated, with appropriate message
 * @developed by "amc"
 */
friend_helper.reject_friend = async id => {
  try {
    let friend = await Friends.remove(id);

    if (friend && friend.n === 0) {
      return {
        status: 2,
        message: "Friend request not found"
      };
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
 * @return  status 0 - If any internal error occured while fetching filtered data, with error
 *          status 1 - If filtered data found, with filtered object
 *          status 2 - If filtered not found, with appropriate message
 */
friend_helper.get_filtered_records = async filter_obj => {
  skip = filter_obj.pageSize * filter_obj.page;
  try {
    var searched_record_count = await Friends.aggregate([{
      $match: filter_obj.columnFilter
    }]);
    var filtered_data = await Friends.aggregate([{
      $match: filter_obj.columnFilter
    },
    {
      $sort: filter_obj.columnSort
    },
    {
      $skip: skip
    },
    {
      $limit: filter_obj.pageSize
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
        filtered_badge_tasks: filtered_data
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

/*
 * count_friends is used to count all friends data
 * @return  status 0 - If any internal error occured while couting friends data, with error
 *          status 1 - If friends data found, with friends object
 *          status 2 - If friends not found, with appropriate message
 */
friend_helper.count_friends = async id => {
  try {
    var count = await Friends.find({
      friendId: id,
      status: 1
    }).count();
    return {
      status: 1,
      message: `Total ${count} pending request `,
      count: count
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while couting friends",
      error: err
    };
  }
};

/*
 * total_count_friends is used to count all friends data
 * @return  status 0 - If any internal error occured while couting friends data, with error
 *          status 1 - If friends data found, with friends object
 *          status 2 - If friends not found, with appropriate message
 */
friend_helper.total_count_friends = async condititon => {
  try {
    var count = await Friends.count(condititon);
    return {
      status: 1,
      message: `Total ${count} approved friends `,
      count: count
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while couting approved friends",
      error: err
    };
  }
};

/*
 * find is used to fetch all friends data
 * @return  status 0 - If any internal error occured while fetching friends data, with error
 *          status 1 - If friends data found, with friends object
 *          status 2 - If friends not found, with appropriate message
 */
friend_helper.find = async id => {
  try {
    var friends = await Users.findOne(id);
    if (friends && friends != null) {
      return {
        status: 1,
        message: "friends found",
        friends: friends
      };
    } else {
      return {
        status: 2,
        message: "No friends available",
        friends: []
      };
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
 * checkFriend is used to check friend 
 * @return  status 0 - If any internal error occured while checking friend data, with error
 *          status 1 - If checking friend data found, with checking friend object
 *          status 2 - If checking friend not found, with appropriate message
 */
friend_helper.checkFriend = async id => {
  try {
    var friends = await Friends.findOne(id);
    if (friends) {
      return {
        status: 1,
        message: "friends found",
        friends: friends
      };
    } else {
      return {
        status: 2,
        message: "No friends available",
        friends: []
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding friends",
      error: err,
      count: 0
    };
  }
};
module.exports = friend_helper;