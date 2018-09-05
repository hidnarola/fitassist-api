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
    badges: {
        type: Number,
        default: null
    },
    workout: {
        type: Object,
        default: null
    },
    activityFeed: {
        type: Number,
        default: null
    },
    bodyFat: {
        type: Object,
        default: null
    },
    // progressPhoto: {
    //     type: Number,
    //     default: null
    // },
    // mobility: {
    //     type: Number,
    //     default: null
    // },
    // muscle: {
    //     type: Number,
    //     default: null
    // },
    // strength: {
    //     type: Number,
    //     default: null
    // },
    // endurance: {
    //     type: Number,
    //     default: null
    // },
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