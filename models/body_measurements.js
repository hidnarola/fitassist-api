//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var MeasurementSchema = new Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
    logDate: {type: Date, required: true},
    neck: {type: Number, required: false},
    shoulders: {type: Number, required: false},
    chest: {type: Number, required: false},
    upperArm: {type: Number, required: false},
    waist: {type: Number, required: false},
    forearm: {type: Number, required: false},
    hips: {type: Number, required: false},
    thigh: {type: Number, required: false},
    calf: {type: Number, required: false},
    weight: {type: Number, required: false},
    height: {type: Number, required: false},

    createdAt: {type: Date, default: Date.now},
    modifiedAt: {type: Date, default: Date.now}
}, {versionKey: false});

// Compile model from schema
var Measurement = mongoose.model('body_measurement', MeasurementSchema, 'body_measurement');

module.exports = Measurement;