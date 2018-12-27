var Follows = require("./../models/follows");
var Users = require("./../models/users");
var _ = require("underscore");
var follow_helper = {};

follow_helper.get_follows = async id => {
    try {
        var follows = await Follows.aggregate([
            {
                $match: id
            },
            {
                $unwind: "$followingId"
            },
            {
                $lookup: {
                    from: "users",
                    localField: "followingId",
                    foreignField: "authUserId",
                    as: "followings"
                }
            },
            {
                $unwind: {
                    path: "$followings"
                }
            },
            {
                $group: {
                    _id: "$userId",
                    follows: {
                        $addToSet: {
                            username: "$followings.username",
                            authUserId: "$followings.authUserId",
                            _id: "$_id",
                            firstName: "$followings.firstName",
                            avatar: "$followings.avatar"
                        }
                    }
                }
            }
        ]);
        if (follows && follows.length > 0) {
            return {
                status: 1,
                message: "follows found",
                follows: follows[0].follows
            };
        } else {
            return {
                status: 2,
                message: "No follows available",
                follows: []
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while finding follows",
            error: err
        };
    }
};

follow_helper.get_follow_by_username = async (username, skip = false, limit = false, sort = false) => {
    try {
        let aggregate = [
            {
                $match: username
            },
            {
                $lookup: {
                    from: "follows",
                    localField: "authUserId",
                    foreignField: "userId",
                    as: "followsList"
                }
            },
            {
                $unwind: {
                    path: "$followsList",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    authUserId: 1,
                    followsList: {
                        $mergeObjects: [
                            "$followsList",
                            {
                                fetch_id: "$followsList.followingId"
                            }
                        ]
                    }
                }
            },
            {
                $lookup: {
                    from: "follows",
                    localField: "authUserId",
                    foreignField: "followingId",
                    as: "followsList2"
                }
            },
            {
                $unwind: {
                    path: "$followsList2",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    authUserId: 1,
                    followsList: 1,
                    followsList2: {
                        $mergeObjects: [
                            "$followsList2",
                            {
                                fetch_id: "$followsList2.userId"
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
                    followsList: {
                        $addToSet: "$followsList"
                    },
                    followsList2: {
                        $addToSet: "$followsList2"
                    }
                }
            },
            {
                $addFields: {
                    followIds: {
                        $concatArrays: ["$followsList", "$followsList2"]
                    }
                }
            },
            {
                $unwind: "$followIds"
            },
            {
                $lookup: {
                    from: "users",
                    localField: "followIds.fetch_id",
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
                        $mergeObjects: ["$user", {friendshipId: "$followIds._id"}]
                    }
                }
            },
            {
                $lookup: {
                    from: "follows",
                    localField: "users.authUserId",
                    foreignField: "followingId",
                    as: "rightside"
                }
            },
            {
                $lookup: {
                    from: "follows",
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
            aggregate.push(
                    {
                        $unwind: "$user"
                    },
                    skip,
                    limit,
                    {
                        $group: {
                            _id: "",
                            user: {
                                $addToSet: "$$ROOT.user"
                            }
                        }
                    }
            );
        }
        aggregate.push(
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
                    "$addFields": {"user.userSettings": "$userSettings"}
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


        let follows = await Users.aggregate(aggregate);
        if (follows && follows.length > 0) {
            _.each(follows[0].user, (follow) => {
                var total_follows = follow.totalFriends;
                var cnt = 0;
                _.each(total_follows, (frd) => {
                    if (frd.status == 2) {
                        cnt++;
                    }
                });
                follow.friendsCount = cnt;
                delete follow.totalFriends;
            });
            return {
                status: 1,
                message: "follows found",
                friends: follows[0].user ? follows[0].user : []
            };
        } else {
            return {
                status: 1,
                message: "No follows available",
                friends: []
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while finding follows",
            error: err
        };
}
};

follow_helper.start_following = async data => {
    let newDataModal = new Follows(data);
    try {
        let response = await newDataModal.save();
        return {
            status: 1,
            message: "follow request sent",
            follow: response
        };
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while sending follow request",
            error: err
        };
    }
};

follow_helper.get_filtered_records = async filter_obj => {
    skip = filter_obj.pageSize * filter_obj.page;
    try {
        var searched_record_count = await Follows.aggregate([
            {
                $match: filter_obj.columnFilter
            }
        ]);
        var filtered_data = await Follows.aggregate([
            {
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
            }
        ]);

        if (filtered_data) {
            return {
                status: 1,
                message: "filtered data is found",
                count: searched_record_count.length,
                filtered_total_pages: Math.ceil(searched_record_count.length / filter_obj.pageSize),
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

follow_helper.total_count_follows = async condititon => {
    try {
        var count = await Follows.count(condititon);
        return {
            status: 1,
            message: "Success",
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

follow_helper.checkFollow = async (userId, followingId) => {
    try {
        var response = await Follows.aggregate([
            {
                $match: {
                    $or: [
                        {
                            userId: userId,
                            followingId: followingId
                        },
                        {
                            userId: followingId,
                            followingId: userId
                        }
                    ]
                }
            }
        ]);
        if (response && response.length > 0) {
            return {
                status: 1,
                message: "follows found",
                follows: response[0]
            };
        } else {
            return {
                status: 2,
                message: "No follows available",
                follows: null
            };
        }
    } catch (err) {
        return {
            status: 0,
            message: "Error occured while finding follows",
            error: err
        };
    }
};
module.exports = follow_helper;