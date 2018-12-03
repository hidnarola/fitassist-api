//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var UserProgressPhotosSchema = new Schema({
    progressId: {type: Schema.Types.ObjectId, ref: "user_progress", field: "_id", required: true},
    tags: [{type: String, default: []}],
    image: {type: String, required: true}
}, {versionKey: false});

// Compile model from schema
var UserProgressPhotos = mongoose.model('user_progress_photos', UserProgressPhotosSchema, 'user_progress_photos');

module.exports = UserProgressPhotos;