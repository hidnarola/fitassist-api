var bcrypt = require("bcrypt");
var common_helper = {};
var async = require("async");
var _ = require("underscore");
var NutritionalLabels = require("./../models/nutritional_labels");
var Nutritions = require("./../models/nutritions");

common_helper.hashPassword = function(callback) {
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
common_helper.get_nutritional_labels = async type => {
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

/*
 * get_nutritions is used to fetch all nutrition
 * 
 * @return  status 0 - If any internal error occured while fetching nutrition data, with error
 *          status 1 - If nutrition data found, with nutrition object
 *          status 2 - If nutrition not found, with appropriate message
 */
common_helper.get_nutritions = async () => {
  try {
    var nutrition = await Nutritions.find();
    if (nutrition) {
      return {
        status: 1,
        message: "Nutrition's details found",
        nutritions: nutrition
      };
    } else {
      return { status: 2, message: "No nutrition available" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding nutrition",
      error: err
    };
  }
};
/*
 * unit_converter is used to convert  all unit
 * 
 * @return  status 0 - If any internal error occured while converting unit data, with error
 *          status 1 - If unit data found, with unit object
 *          status 2 - If unit not found, with appropriate message
 */
common_helper.unit_converter = async (data, unit) => {
  var calculatedData;

  switch (unit) {
    case "cm":
      return { baseValue: data, baseUnit: "cm" };
      break;
    case "feet":
      calculatedData = data * 30.48;
      return { baseValue: calculatedData, baseUnit: "cm" };
      break;
    case "kg":
      calculatedData = data * 1000;
      return { baseValue: calculatedData, baseUnit: "g" };
      break;
    case "lb":
      calculatedData = data / 0.0022046;
      return { baseValue: calculatedData, baseUnit: "g" };
      break;
    case "in":
      calculatedData = data * 2.54;
      return { baseValue: calculatedData, baseUnit: "cm" };
      break;
    case "hour":
      calculatedData = data * 60;
      return { baseValue: calculatedData, baseUnit: "minute" };
      break;
    case "minute":
      return { baseValue: data, baseUnit: "minute" };
      break;
    case "km":
      calculatedData = data * 1000;
      return { baseValue: calculatedData, baseUnit: "meter" };
      break;
    case "meter":
      return { baseValue: data, baseUnit: "meter" };
      break;
    case "mile":
      calculatedData = data * 1609.344;
      return { baseValue: calculatedData, baseUnit: "meter" };
      break;
    case "g":
      return { baseValue: data, baseUnit: "g" };
      break;
    case "mg":
      calculatedData = data / 1000;
      return { baseValue: calculatedData, baseUnit: "g" };
      break;
    default:
      return { baseValue: data, baseUnit: unit };
      break;
  }
};
module.exports = common_helper;
