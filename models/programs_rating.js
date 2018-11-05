//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var ProgramsRatingSchema = new Schema({
    userId: {
        type: String,
        ref: "users",
        field: "authUserId",
        required: true
    },
    programId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user_programs",
        required: true
    },
    rating: {
        type: Number,
        default: 0,
        required: true
    },
    comment: {
        type: String,
        default: ""
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
var ProgramsRating = mongoose.model("programs_rating", ProgramsRatingSchema, "programs_rating");

module.exports = ProgramsRating;