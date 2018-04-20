//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var BadgeCategorySchema = new Schema({
    name: {type: String, required:true},
    status: {type: Number, default:1},
    isDeleted: {type: Number, default:0},
    createdAt: {type: Date, default: Date.now},
    modifiedAt: {type: Date, default: Date.now}
}, {versionKey: false});

// Compile model from schema
var BadgeCategory = mongoose.model('badge_categories', BadgeCategorySchema, 'badge_categories');

module.exports = BadgeCategory;