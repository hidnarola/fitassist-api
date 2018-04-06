//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var ItemsSchema = new Schema({
    name: {type: String, required:true},
    details: {type: String,default:null},
    image:{type:String,default:null},
    isDelete: {type:Boolean, default:0},
    status: {type:Number, default: 1},
    createdAt: {type: Date, default: Date.now},
    modifiedAt: {type: Date, default: Date.now}
}, {versionKey: false});

// Compile model from schema
var Items = mongoose.model('items', ItemsSchema, 'items');

module.exports = Items;