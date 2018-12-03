//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var UserProgressSchema = new Schema({
    userId: {type:String, ref: "users", field:"authUserId", required: true},
    description: {type:String,default:null},
    date: {type: Date, default: Date.now},
    createdAt: {type: Date, default: Date.now}
}, {versionKey: false});

// Compile model from schema
var UserProgress = mongoose.model('user_progress', UserProgressSchema, 'user_progress');

module.exports = UserProgress;