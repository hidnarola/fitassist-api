//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var NutritionSchema = new Schema({
    name: {type: String, required:true, unique:true},
    ntrCode: {type: String, required:true,unique:true},
    unit: {type: String, required:true},
    createdAt: {type: Date, default: Date.now},
    modifiedAt: {type: Date, default: Date.now}
}, {versionKey: false});

// Compile model from schema
var Nutrition = mongoose.model('nutritions', NutritionSchema, 'nutritions');

module.exports = Nutrition;