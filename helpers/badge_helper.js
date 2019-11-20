var Badges = require("./../models/badges");
var FavouriteBadges = require("./../models/favourite_badges");
var _ = require("underscore");
var badge_helper = {};

/*
 * get_badges is used to fetch all badges data
 * @return  status 0 - If any internal error occured while fetching badges data, with error
 *          status 1 - If badges data found, with badges object
 *          status 2 - If badges not found, with appropriate message
 */
badge_helper.get_badges_group_by = async authUserId => {
  try {
    var badges = await Badges.aggregate([
      {
        $match: {
          // isDeleted: 0,
          // status: 1
          $and: [
            {
              isDeleted: 0
            },
            {
              status: 1
            }
          ]
        }
      },
      {
        $group: {
          _id: "$category",
          category: {
            $first: "$category"
          },
          badges: {
            $addToSet: "$$ROOT"
          }
        }
      },
      {
        $lookup: {
          from: "badges_assign",
          localField: "badges._id",
          foreignField: "badgeId",
          as: "badgeDetail"
        }
      }
    ]);

    var retunArray = [];
    _.each(badges, badge => {
      var subArray = [];
      _.each(badge.badges, b => {
        var obj = Object.assign({}, b);
        var result = _.find(badge.badgeDetail, function(o) {
          if (
            o.userId.toString() === authUserId.toString() &&
            o.badgeId.toString() === obj._id.toString()
          ) {
            return true;
          } else {
            return false;
          }
        });
        if (result) {
          obj.isCompleted = 1;
          obj.completedDate = result.createdAt;
        } else {
          obj.isCompleted = 0;
          obj.completedDate = null;
        }
        subArray.push(obj);
      });
      badge.badges = subArray;
      retunArray.push(badge);
    });

    if (badges) {
      return {
        status: 1,
        message: "badges found",
        badges: retunArray
      };
    } else {
      return {
        status: 2,
        message: "No badge available"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding badge",
      error: err
    };
  }
};
/*
 * get_badges is used to fetch all badges data
 * @return  status 0 - If any internal error occured while fetching badges data, with error
 *          status 1 - If badges data found, with badges object
 *          status 2 - If badges not found, with appropriate message
 */
badge_helper.get_badges = async (condition = {}) => {
  try {
    var badge = await Badges.find(condition);
    if (badge) {
      return {
        status: 1,
        message: "badges found",
        badges: badge
      };
    } else {
      return {
        status: 2,
        message: "No badge available"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding badge",
      error: err
    };
  }
};

/*
 * get_badge_id is used to fetch badge by ID
 * @return  status 0 - If any internal error occured while fetching badge data, with error
 *          status 1 - If badge data found, with badge object
 *          status 2 - If badge data not found, with appropriate message
 */
badge_helper.get_badge_id = async id => {
  try {
    var badge = await Badges.findOne({
      _id: id
    });
    if (badge) {
      return {
        status: 1,
        message: "badge found",
        badge: badge
      };
    } else {
      return {
        status: 2,
        message: "No badge available"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding badge ",
      error: err
    };
  }
};

/*
 * insert_badge is used to insert into badge collection
 * @param   badge_obj     JSON object consist of all property that need to insert in collection
 * @return  status  0 - If any error occur in inserting badge, with error
 *          status  1 - If badge inserted, with inserted badge document and appropriate message
 * @developed by "amc"
 */
badge_helper.insert_badge = async badge_obj => {
  let badge = new Badges(badge_obj);
  try {
    let badge_data = await badge.save();
    return {
      status: 1,
      message: "badge inserted",
      badge: badge_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting badge",
      error: err
    };
  }
};

/*
 * update_badge_by_id is used to update badge data based on badge_id
 * @param   badge_id         String  _id of badge that need to be update
 * @param   badge_obj     JSON    object consist of all property that need to update
 * @return  status  0 - If any error occur in updating badge, with error
 *          status  1 - If badge updated successfully, with appropriate message
 *          status  2 - If badge not updated, with appropriate message
 * @developed by "amc"
 */
badge_helper.update_badge_by_id = async (badge_id, badge_obj) => {
  try {
    let badge = await Badges.findOneAndUpdate(
      {
        _id: badge_id
      },
      badge_obj,
      {
        new: true
      }
    );
    if (!badge) {
      return {
        status: 2,
        message: "Record has not updated"
      };
    } else {
      return {
        status: 1,
        message: "Record has been updated",
        badge: badge
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating badge",
      error: err
    };
  }
};

/*
 * delete_badge_by_id is used to delete badge from database
 * @param   badge_id String  _id of badge that need to be delete
 * @return  status  0 - If any error occur in deletion of badge, with error
 *          status  1 - If badge deleted successfully, with appropriate message
 * @developed by "amc"
 */
badge_helper.delete_badge_by_id = async badge_id => {
  try {
    let resp = await Badges.findOneAndUpdate(
      {
        _id: badge_id
      },
      {
        isDeleted: 1
      }
    );
    if (!resp) {
      return {
        status: 2,
        message: "badge not found"
      };
    } else {
      return {
        status: 1,
        message: "badge deleted"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while deleting badge",
      error: err
    };
  }
};

/*
 * undo_badge_by_id is used to undo badge from database
 * @param   badge_id String  _id of badge that need to be undo
 * @return  status  0 - If any error occur in undo of badge, with error
 *          status  1 - If badge undo successfully, with appropriate message
 * @developed by "amc"
 */
badge_helper.undo_badge_by_id = async badge_id => {
  try {
    let resp = await Badges.findOneAndUpdate(
      {
        _id: badge_id
      },
      {
        isDeleted: 0
      }
    );
    if (!resp) {
      return {
        status: 2,
        message: "badge not found"
      };
    } else {
      return {
        status: 1,
        message: "badge recovered"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while recovering badge",
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
badge_helper.get_filtered_records = async filter_obj => {
  skip = filter_obj.pageSize * filter_obj.page;
  try {
    var searched_record_count = await Badges.aggregate([
      {
        $match: filter_object.columnFilter
      }
    ]);
    var filtered_data = await Badges.aggregate([
      {
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
      }
    ]);

    if (filtered_data) {
      return {
        status: 1,
        message: "filtered data is found",
        count: searched_record_count.length,
        filtered_total_pages: Math.ceil(
          searched_record_count.length / filter_obj.pageSize
        ),
        filtered_badges: filtered_data
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

badge_helper.check_favourite_badges_by_id = async badgesId => {
  try {
    let badges_data = await FavouriteBadges.findOne({ badgesId: badgesId });
    if (badges_data) {
      return {
        status: 1,
        message: "badge found",
        badgesId: badges_data
      };
    } else {
      return {
        status: 2,
        message: "No badge available"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding badge_id ",
      error: err
    };
  }
};

badge_helper.add_favourite_badges = async obj => {
  let favourite_badge = new FavouriteBadges(obj);
  try {
    var resp_data = await favourite_badge.save();
    return {
      status: 1,
      message: "favourite badge inserted",
      badge: resp_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while inserting favourite badge",
      error: err
    };
  }
};

badge_helper.update_favourite_badges = async (badge_id, obj) => {
  try {
    var resp_data = await FavouriteBadges.findOneAndUpdate(
      { _id: badge_id },
      obj,
      {
        new: true
      }
    );
    return {
      status: 1,
      message: "favourite badge updated",
      badge: resp_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating favourite badge",
      error: err
    };
  }
};

badge_helper.get_all_favourite_badges_by_userId = async uID => {
  try {
    var resp_data = await FavouriteBadges.aggregate([
      {
        $match: { userId: uID }
      },
      {
        $lookup: {
          from: "badges",
          localField: "badgesId",
          foreignField: "_id",
          as: "badge"
        }
      },
      {
        $unwind: "$badge"
      }
    ]);
    return {
      status: 1,
      message: "favourite badge found",
      badges: resp_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while fetch favourite badge",
      error: err
    };
  }
};

module.exports = badge_helper;
