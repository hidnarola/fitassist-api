var bcrypt = require("bcrypt");
var common_helper = {};
var async = require("async");
var _ = require("underscore");

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

  //   async.forEach(data.columnFilterEqual, function(val, next) {
  //     var key = val.id;
  //     var value = val.value;
  //     columnFilterEqual[key] = value;
  //   });
  data = {
    pageSize: data.pageSize,
    page: data.page,
    // columnFilterEqual,
    columnSort,
    columnFilter
  };
  return data;
};

module.exports = common_helper;
