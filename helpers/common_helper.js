var bcrypt = require('bcrypt');
var common_helper = {};
var async = require("async");

common_helper.hashPassword = function (callback) {
    console.log("in hash password");
    bcrypt.compare(this.password, this.hash, function (err, res) {
        if (err) {
            callback({"status":0,"error":err});
        } else {
            callback({"status":1,"res":res});
        }
    });
};

common_helper.changeObject = function (data,callback) {
    //console.log(data);
    columnFilter=[];
    columnSort=[];
    filter=[];
    columnFilterEqual=[];
    async.forEach(data.columnFilter, function(val, next) {
        var key=val.id;
        var re = new RegExp(val.value, 'i');
        var value={$regex: re};
        
        columnFilter.push({[key]:value});

    });
    // app.User.find().or([{ 'firstName': {  }}, { 'lastName': { $regex: re }}]).sort('title', 1).exec(function(err, users) {
    //     res.json(JSON.stringify(users));
    // });
    async.forEach(data.columnSort, function(val, next) {
        var key=val.id;
        var value=val.value;
        columnSort.push({[key]:value});
    });

    async.forEach(data.columnFilterEqual, function(val, next) {
        var key=val.id;
        var value=val.value;   
        columnFilterEqual.push({[key]:value});
        
    });
    data={
        "pageSize":data.pageSize,
        "page":data.page,
        columnFilterEqual,
        columnSort,
        columnFilter
    };
    return data;
};

module.exports = common_helper;