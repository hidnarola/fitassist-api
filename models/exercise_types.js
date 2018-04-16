//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var ExerciseTypes = new Schema({
    name: {type: String, required:true},
    description: {type: String, required:false},
    status: {type: Number, default:1},
    createdAt: {type: Date, default: Date.now},
    modifiedAt: {type: Date, default: Date.now}
}, {versionKey: false});

// Compile model from schema
var Exercise_types = mongoose.model('exercise_types', ExerciseTypes, 'exercise_types');

module.exports = Exercise_types;