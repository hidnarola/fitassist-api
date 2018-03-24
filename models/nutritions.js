//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var NutritionSchema = new Schema({
    name: {type: String, required:true},
    description: {type: String, required:false},
    createdAt: {type: Date, default: Date.now},
    modifiedAt: {type: Date, default: Date.now}
}, {versionKey: false});

// Compile model from schema
var Nutrition = mongoose.model('nutrition', NutritionSchema, 'nutrition');

module.exports = Nutrition;