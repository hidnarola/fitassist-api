//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var ExercisePreferenceSchema = new Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
    
    createdAt: {type: Date, default: Date.now},
    modifiedAt: {type: Date, default: Date.now}
}, {versionKey: false});

// Compile model from schema
var Measurement = mongoose.model('body_measurement', ExercisePreferenceSchema, 'exercise_preference');

module.exports = Measurement;