//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var MeasurementSchema = new Schema({
    userId: {
        type: String,
        ref: "users",
        field: "authUserId",
        required: true
    },
    logDate: {
        type: Date,
        required: true
    },
    neck: {
        type: Number,
        required: false,
        default: 0
    },
    shoulders: {
        type: Number,
        required: false,
        default: 0
    },
    chest: {
        type: Number,
        required: false,
        default: 0
    },
    upperArm: {
        type: Number,
        required: false,
        default: 0
    },
    waist: {
        type: Number,
        required: false,
        default: 0
    },
    forearm: {
        type: Number,
        required: false,
        default: 0
    },
    hips: {
        type: Number,
        required: false,
        default: 0
    },
    thigh: {
        type: Number,
        required: false,
        default: 0
    },
    calf: {
        type: Number,
        required: false,
        default: 0
    },
    weight: {
        type: Number,
        required: false,
        default: 0
    },
    height: {
        type: Number,
        required: false,
        default: 0
    },
    heartRate: {
        type: Number,
        required: false,
        default: 0
    },
    bodyFat: {
        type: Object,
        required: false,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    modifiedAt: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false
});

// Compile model from schema
var Measurement = mongoose.model('body_measurement', MeasurementSchema, 'body_measurement');

module.exports = Measurement;