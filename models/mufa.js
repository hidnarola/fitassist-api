//Require Mongoose
var mongoose = require("mongoose");
var _ = require("underscore");
var constant = require("../constant");

//Define a schema
var Schema = mongoose.Schema;

var mufaSchema = new Schema({
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
    c10_Fa: {
        type: String
    },
    cis_c10_Fa: {
        type: String
    },
    c12_Fa: {
        type: String
    },
    cis_c12_Fa: {
        type: String
    },
    c14_Fa: {
        type: String
    },
    cis_c14_Fa: {
        type: String
    },
    c15_Fa: {
        type: String
    },
    cis_c15_Fa: {
        type: String
    },
    c16_Fa: {
        type: String
    },
    cis_c16_Fa: {
        type: String
    },
    c17_Fa: {
        type: String
    },
    cis_c17_Fa: {
        type: String
    },
    c18_Fa: {
        type: String
    },
    cis_c18_Fa: {
        type: String
    },
    cis_trans_c18_1n_9_Fa: {
        type: String
    },
    cis_trans_c18_1n_7_Fa: {
        type: String
    },
    c20_Fa: {
        type: String
    },
    cis_c20_Fa: {
        type: String
    },
    c22_Fa: {
        type: String
    },
    cis_c22_Fa: {
        type: String
    },
    cis_trans_c22_1n_11_Fa: {
        type: String
    },
    cis_trans_c22_1n_9_Fa: {
        type: String
    },
    c24_Fa: {
        type: String
    },
    cis_c24_Fa: {
        type: String
    },
    trans_monounsaturated_Fa: {
        type: String
    },
}, {
        versionKey: false
    });

// Compile model from schema
var mufa = mongoose.model("mufa", mufaSchema, "mufa");

module.exports = mufa;