//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var EquipmentCategorySchema = new Schema({
    name: {type: String, required:true},
    description: {type: String, required:false},
    createdAt: {type: Date, default: Date.now},
    modifiedAt: {type: Date, default: Date.now}
}, {versionKey: false});

// Compile model from schema    
var Equipment_category = mongoose.model('equipment_category', EquipmentCategorySchema, 'equipment_category');

module.exports = Equipment_category;