//Require Mongoose
var mongoose = require("mongoose");
let constant = require("../constant");

//Define a schema
var Schema = mongoose.Schema;

var ImagesSchema = new Schema({
  image: { type: String }
});

var IsolationSchema = new Schema({
  bodyparts_id: {
    type: Schema.Types.ObjectId,
    ref: "bodyparts",
    field: "_id"
  }
});

var UserProgressActivityPhotosSchema = new Schema(
  {
    userId: { type: String, ref: "users", field: "authUserId", required: true },
    progressId: {
      type: Schema.Types.ObjectId,
      ref: "user_progress",
      field: "_id",
      required: true
    },
    category: {
      type: String,
      enum: [
        constant.PROGRESS_PHOTO_CATEGORY.basic,
        constant.PROGRESS_PHOTO_CATEGORY.isolation,
        constant.PROGRESS_PHOTO_CATEGORY.posed,
        constant.PROGRESS_PHOTO_CATEGORY.lifestyle,
        null
      ],
      default: null
    },
    basic: {
      type: Array,
      default: null
    },
    isolation: {
      type: [{ type: IsolationSchema }],
      default: null
    },
    posed: {
      type: Array,
      default: null
    },
    caption: { type: String, default: null },
    image: [{ type: ImagesSchema }],
    hashTags: { type: Array, default: null },
    visibility: { type: Number, default: 3 },
    date: { type: Date, default: Date.now }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "modifiedAt"
    },
    versionKey: false
  }
);

// var UserProgressActivityPhotosSchema = new Schema(
//   {
//     userId: { type: String, ref: "users", field: "authUserId", required: true },
//     progressId: {
//       type: Schema.Types.ObjectId,
//       ref: "user_progress",
//       field: "_id",
//       required: true
//     },
//     category: {
//       type: String,
//       enum: [
//         constant.PROGRESS_PHOTO_CATEGORY.basic,
//         constant.PROGRESS_PHOTO_CATEGORY.isolation,
//         constant.PROGRESS_PHOTO_CATEGORY.posed,
//         null
//       ],
//       default: null
//     },
//     basic: {
//       type: String,
//       enum: [
//         constant.PROGRESS_PHOTO_BASIC.front,
//         constant.PROGRESS_PHOTO_BASIC.back,
//         constant.PROGRESS_PHOTO_BASIC.side,
//         null
//       ],
//       default: null
//     },
//     isolation: {
//       type: Schema.Types.ObjectId,
//       ref: "bodyparts",
//       field: "_id",
//       default: null
//     },
//     posed: {
//       type: String,
//       enum: [
//         constant.PROGRESS_PHOTO_POSED.front_lat_spread,
//         constant.PROGRESS_PHOTO_POSED.front_double_biceps,
//         null
//       ],
//       default: null
//     },
//     caption: { type: String, default: null },
//     image: { type: String, required: true },
//     createdAt: { type: Date, default: Date.now }
//   },
//   { versionKey: false }
// );

// Compile model from schema
var UserProgressPhotos = mongoose.model(
  "user_progress_photos",
  UserProgressActivityPhotosSchema,
  "user_progress_photos"
);

module.exports = UserProgressPhotos;
