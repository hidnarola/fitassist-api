//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var WidgetsSettingsSchema = new Schema({
    userId: {
        type: String,
        ref: "users",
        field: "authUserId",
        required: true
    },
    status: {
        type: Number,
        default: 1
    },
    isDeleted: {
        type: Number,
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
var WidgetsSettings = mongoose.model('widgets_settings', WidgetsSettingsSchema, 'widgets_settings');

module.exports = WidgetsSettings;