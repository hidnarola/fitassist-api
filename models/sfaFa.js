//Require Mongoose
var mongoose = require("mongoose");
var _ = require("underscore");
var constant = require("../constant");

//Define a schema
var Schema = mongoose.Schema;

var SfaFaSchema = new Schema({
    foodCode: {
        type: String
    },
    foodName: {
        type: String
    },
    description: {
        type: String
    },
    group: {
        type: String,
    },
    previous: {
        type: String
    },
    mainDataReference: {
        type: String
    },
    footNote: {
        type: String
    },
    c4: {
        type: String
    },
    c6: {
        type: String
    },
    c8: {
        type: String
    },
    c10: {
        type: String
    },
    c11_Br_Fa: {
        type: String
    },
    c12: {
        type: String
    },
    c12_Br_Fa: {
        type: String
    },
    c13: {
        type: String
    },
    c13_Br_Fa: {
        type: String
    },
    c14: {
        type: String
    },
    c14_Br_Fa: {
        type: String
    },
    c15: {
        type: String
    },
    c15_Br_Fa : {
        type: String
    },
    c16 : {
        type: String
    },
    c16_Br_Fa : {
        type: String
    },





    c17 : {
        type: String
    },
    c17_Br_Fa : {
        type: String
    },
    c18 : {
        type: String
    },
    c18_Br_Fa : {
        type: String
    },
    c20 : {
        type: String
    },
    c20_Br_Fa : {
        type: String
    },
    c22 : {
        type: String
    },
    c22_Br_Fa : {
        type: String
    },
    c24 : {
        type: String
    },
    c24_Br_Fa : {
        type: String
    },
    c25_Br_Fa : {
        type: String
    }
}, {
        versionKey: false
    });

// Compile model from schema
var SfaFa = mongoose.model("sfaFa", SfaFaSchema, "sfaFa");

module.exports = SfaFa;