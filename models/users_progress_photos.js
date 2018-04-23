//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var UserProgressPhotosSchema = new Schema({
    userId: {type:String, ref: "users", field:"authUserId", required: true},
    description: {type:String,default:null},
    image: {type:String,required:true},
    status:{type:Number,default:1},
    isDeleted:{type:Number,default:0},
    createdAt: {type: Date, default: Date.now},
    modifiedAt: {type: Date, default: Date.now}
}, {versionKey: false});

// Compile model from schema
var UserProgressPhotos = mongoose.model('user_progress_photos', UserProgressPhotosSchema, 'user_progress_photos');

module.exports = UserProgressPhotos;