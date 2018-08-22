//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var WidgetsSettingsSchema = new Schema({
    userId: {
        type: String,
        ref: "users",
        field: "authUserId",
        required: true,
    },
    widgetFor: {
        type: String,
        enum: ["dashboard", "timeline"],
        default: null
    },
    graph: [{
        type: String,
        default: null
    }],
    badges: [{
        type: String,
        default: null
    }],
    progress: [{
        type: String,
        default: null
    }],
    workout: {
        type: Number,
        default: null
    },
    meal: {
        type: Number,
        default: null
    },
    activityFeed: {
        type: Number,
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
var WidgetsSettings = mongoose.model('widgets_settings', WidgetsSettingsSchema, 'widgets_settings');

module.exports = WidgetsSettings;