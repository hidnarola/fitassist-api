var bcrypt = require("bcrypt");
var common_helper = {};
var async = require("async");
var _ = require("underscore");
var NutritionalLabels = require("./../models/nutritional_labels");

common_helper.hashPassword = function(callback) {
  console.log("in hash password");
  bcrypt.compare(this.password, this.hash, function(err, res) {
    if (err) {
      callback({ status: 0, error: err });
    } else {
      callback({ status: 1, res: res });
    }
  });
};

common_helper.changeObject = function(data, callback) {
  columnFilter = {};
  columnSort = {};
  filter = [];
  //   columnFilterEqual = {};

  async.forEach(data.columnFilter, function(val, next) {
    var key = val.id;
    var value = val.value;
    if (val.isDigitFlag) {
      value = parseInt(val.value);
    } else if (!val.isEqualFlag) {
      re = new RegExp(val.value, "i");
      value = { $regex: re };
    }
    columnFilter[key] = value;
  });
  if (data.columnSort && data.columnSort.length > 0) {
    async.forEach(data.columnSort, function(val, next) {
      var key = val.id;
      var value = 1;
      if (val.desc) {
        value = -1;
      }
      columnSort[key] = value;
    });
  } else {
    columnSort["_id"] = -1;
  }

  data = {
    pageSize: data.pageSize,
    page: data.page,
    // columnFilterEqual,
    columnSort,
    columnFilter
  };
  return data;
};


/*
 * get_nutritional_labels is used to fetch all health_label data
 * 
 * @return  status 0 - If any internal error occured while fetching get_nutritional_labels data, with error
 *          status 1 - If get_nutritional_labels data found, with get_nutritional_labels object
 *          status 2 - If get_nutritional_labels not found, with appropriate message
 */
common_helper.get_nutritional_labels = async (type) => {
  try {
    var nutritional_labels_data = await NutritionalLabels.find(type);
    if (nutritional_labels_data) {
      return {
        status: 1,
        message: "nutritional labels found",
        labels: nutritional_labels_data
      };
    } else {
      return { status: 2, message: "No nutritional labels available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding nutritional labels",
      error: err
    };
  }
};
module.exports = common_helper;
