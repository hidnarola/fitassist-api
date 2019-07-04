//Require Mongoose
var mongoose = require("mongoose");
var _ = require("underscore");
var constant = require("../constant");

//Define a schema
var Schema = mongoose.Schema;

var pufaSchema = new Schema({
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


    c16_2_Fa: {
        type: String
    },
    cis_c16_2_Fa: {
        type: String
    },
    cis_c16_3_Fa: {
        type: String
    },
    c16_4_Fa: {
        type: String
    },
    cis_c16_4_Fa: {
        type: String
    },
    unknown_c16_poly_Fa: {
        type: String
    },
    c18_2_Fa:{
        type: String
    },
    cis_n_6_c18_2_Fa: {
        type: String
    },
    c18_3_Fa: {
        type: String
    },
    cis_n_3_c18_3_Fa: {
        type: String
    },
    cis_n_6_c18_3_Fa: {
        type: String
    },
    c18_4_Fa: {
        type: String
    },
    cis_n_3_c18_4_Fa: {
        type: String
    },
    unknown_c18_poly_Fa:{
        type: String
    },
    c20_2_Fa: {
        type: String
    },
    cis_n_6_c20_2_Fa: {
        type: String
    },
    c20_3_Fa: {
        type: String
    },
    cis_n_6_c20_3_Fa: {
        type: String
    },
    c20_4_Fa: {
        type: String
    },
    cis_n_6_c20_4_Fa: {
        type: String
    },
    c20_5_Fa: {
        type: String
    },
    cis_n_3_c20_5_Fa: {
        type: String
    },
    unknown_c20_poly_Fa: {
        type: String
    },
    c21_Fa: {
        type: String
    },
    cis_n_3_c21_5_Fa: {
        type: String
    },
    c22_2_Fa: {
        type: String
    },
    cis_n_6_c22_2_Fa: {
        type: String
    },
    cis_n_6_c22_3_Fa: {
        type: String
    },
    c22_4_Fa: {
        type: String
    },
    cis_n_6_c22_4_Fa: {
        type: String
    },
    c22_5_Fa: {
        type: String
    },
    cis_n_3_c22_5_Fa: {
        type: String
    },
    c22_6_Fa: {
        type: String
    },
    cis_n_3_c22_6_Fa: {
        type: String
    },
    unknown_c22_poly_Fa: {
        type: String
    },
    trans_poly_Fa: {
        type: String
    },
},
    {
        versionKey: false
    });

// Compile model from schema
var pufa = mongoose.model("pufa", pufaSchema, "pufa");

module.exports = pufa;