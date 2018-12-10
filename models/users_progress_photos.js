//Require Mongoose
var mongoose = require('mongoose');
let constant = require('../constant');

//Define a schema
var Schema = mongoose.Schema;

var UserProgressPhotosSchema = new Schema({
    userId: {type: String, ref: "users", field: "authUserId", required: true},
    progressId: {type: Schema.Types.ObjectId, ref: "user_progress", field: "_id", required: true},
    basic: {type: String, enum: [constant.PROGRESS_PHOTO_BASIC.front, constant.PROGRESS_PHOTO_BASIC.back, constant.PROGRESS_PHOTO_BASIC.side], required: true},
    isolation: {type: Schema.Types.ObjectId, ref: "bodyparts", field: "_id", required: true},
    posed: {type: String, default: null},
    caption: {type: String, default: null},
    image: {type: String, required: true}
}, {versionKey: false});

// Compile model from schema
var UserProgressPhotos = mongoose.model('user_progress_photos', UserProgressPhotosSchema, 'user_progress_photos');

module.exports = UserProgressPhotos;