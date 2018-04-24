//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var UsersGalleryPhotosSchema = new Schema({
    userId: {type:String, ref: "users", field:"authUserId", required: true},
    description: {type:String,default:null},
    image: {type:String,required:true},
    privacy:{type:Number,default:3},
    status:{type:Number,default:1},
    isDeleted:{type:Number,default:0},
    createdAt: {type: Date, default: Date.now},
    modifiedAt: {type: Date, default: Date.now}
}, {versionKey: false});

// Compile model from schema
var UsersGalleryPhotos = mongoose.model('users_gallery_photos', UsersGalleryPhotosSchema, 'users_gallery_photos');

module.exports = UsersGalleryPhotos;