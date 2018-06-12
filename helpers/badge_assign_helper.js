var BadgesAssign = require("./../models/badges_assign");
var badges_assign_helper = {};

/*
 * get_all_badges is used to fetch all badges data
 * 
 * @return  status 0 - If any internal error occured while fetching badges data, with error
 *          status 1 - If badges data found, with badges object
 *          status 2 - If badges not found, with appropriate message
 */
badges_assign_helper.get_all_badges = async (
  condition = {},
  skip = {},
  limit = {},
  sort = {}
) => {
  try {
    var badges = await BadgesAssign.aggregate([
      {
        $match: condition
      },
      skip,
      limit,
      sort
    ]);
    if (badges) {
      return {
        status: 1,
        message: "badges found",
        badges: badges
      };
    } else {
      return { status: 2, message: "No badges available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding badges",
      error: err
    };
  }
};

/*
 * find_badge is used to fetch badge by ID
 * @return  status 0 - If any internal error occured while fetching badge data, with error
 *          status 1 - If badge data found, with badge object
 *          status 2 - If badge data not found, with appropriate message
 */
badges_assign_helper.find_badge = async id => {
  try {
    var badge = await BadgesAssign.findOne(id);
    if (badge) {
      return { status: 1, message: "badge found", badge: badge };
    } else {
      return { status: 2, message: "No badge available" };
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
badges_assign_helper.insert_badge = async badge_obj => {
  console.log(badge_obj);
  let badge = new BadgesAssign(badge_obj);
  try {
    let badge_data = await badge.save();
    return {
      status: 1,
      message: "badge assigned",
      badge: badge_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while assigning badge",
      error: err
    };
  }
};

module.exports = badges_assign_helper;
