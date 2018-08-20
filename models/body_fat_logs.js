//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var BodyFatLogsSchema = new Schema({
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
    site1: {
        type: Number,
        required: false,
        default: 0
    },
    site2: {
        type: Number,
        required: false,
        default: 0
    },
    site3: {
        type: Number,
        required: false,
        default: 0
    },
    bodyFatPer: {
        type: Number,
        required: false,
        default: 0
    },
    age: {
        type: Number,
        required: false,
        default: 0
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
var BodyFatLogs = mongoose.model('body_fat_logs', BodyFatLogsSchema, 'body_fat_logs');

module.exports = BodyFatLogs;