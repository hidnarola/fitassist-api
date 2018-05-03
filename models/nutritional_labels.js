//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var NutritionalLabelSchema = new Schema({
    label: {type: String, required:true,unique:true},
    type: {type: String,enum:['diet','health'], required:true,unique:true},
    parameter: {type: String,required:true,unique:true},
    description: {type: String},
    createdAt: {type: Date, default: Date.now},
    modifiedAt: {type: Date, default: Date.now}
}, {versionKey: false});

// Compile model from schema
var NutritionalLabels = mongoose.model('nutritional_labels', NutritionalLabelSchema, 'nutritional_labels');

module.exports = NutritionalLabels;