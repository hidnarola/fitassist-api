var express = require("express");
var router = express.Router();
var config = require("../../config");
var constant = require("../../constant");
var logger = config.logger;
var jwtDecode = require("jwt-decode");
var exercise_preference_helper = require("../../helpers/exercise_preference_helper");

/**
 * @api {get} /user/exercise_preference Get by User ID
 * @apiName Get by User ID
 * @apiGroup User Exercise Preferences
 * @apiHeader {String}  authorization user's unique access-key
 * @apiSuccess (Success 200) {Array} exercise_preference exercise_preference's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  logger.trace("Get exercise preference by ID API called : ", authUserId);
  var resp_data = await exercise_preference_helper.get_exercise_preference_by_user_id({
    userId: authUserId
  });
  if (resp_data.status == 0) {
    logger.error(
      "Error occured while fetching exercise preference = ",
      resp_data
    );
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  } else {
    logger.trace("exercise Preference got successfully = ", resp_data);
    res.status(config.OK_STATUS).json(resp_data);
  }
});

/**
 * @api {post} /user/exercise_preference Save exercise Preference
 * @apiName Save
 * @apiGroup User Exercise Preferences
 * @apiDescription Add exercise Preference if not exists else update existing document
 * @apiHeader {String}  Content-Type application/json
 * @apiHeader {String}  authorization user's unique access-key
 * @apiParam {Number} workoutIntensity workout Intensity of user exercise
 * @apiParam {Number} exerciseExperience exercise Experience
 * @apiParam {String[]} excludeExercise exclude Exercise ref ID
 * @apiParam {String[]} excludeExerciseType exclude Exercise Type ref ID of exercise type
 * @apiParam {String[]} existingInjuries existing Injuries ref ID of body part collection
 * @apiParam {Number} workoutscheduletype workout schedule type <br><code>1 for Automatic <br>2 for manual</code>
 * @apiParam {Object} timeSchedule timeSchedule of exercise preference <br><code>{
 * "monday":10,
 * "tuesday":20,
 * "wednesday":40,
 * "thursday":103,
 * "friday":40,
 * "saturday":50,
 * "sunday":70
 * }</code>
 *
 * @apiSuccess (Success 200) {JSON} exercise_preference exercise_preference details
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.post("/", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;

  var exercise_preference_obj = {
    userId: authUserId
  };
  if (req.body.workoutIntensity && req.body.workoutIntensity != 0) {
    exercise_preference_obj.workoutIntensity = req.body.workoutIntensity;
  } else {
    exercise_preference_obj.workoutIntensity = 0;
  }
  if (req.body.exerciseExperience && req.body.exerciseExperience != 0) {
    exercise_preference_obj.exerciseExperience = req.body.exerciseExperience;
  } else {
    exercise_preference_obj.exerciseExperience = 0;
  }
  if (req.body.excludeExercise) {
    exercise_preference_obj.excludeExercise = req.body.excludeExercise;
  }
  if (req.body.excludeExerciseType) {
    exercise_preference_obj.excludeExerciseType = req.body.excludeExerciseType;
  }
  if (req.body.existingInjuries) {
    exercise_preference_obj.existingInjuries = req.body.existingInjuries;
  }
  if (req.body.workoutscheduletype && req.body.workoutscheduletype != 0) {
    exercise_preference_obj.workoutscheduletype = req.body.workoutscheduletype;
  } else {
    exercise_preference_obj.workoutscheduletype = 0;
  }
  if (req.body.timeSchedule) {
    exercise_preference_obj.timeSchedule = req.body.timeSchedule;
  }
  if (req.body.experienceLevel && req.body.experienceLevel != 0) {
    exercise_preference_obj.experienceLevel = req.body.experienceLevel;
  } else {
    exercise_preference_obj.experienceLevel = 0;
  }
  if (req.body.workoutLocation) {
    exercise_preference_obj.workoutLocation = req.body.workoutLocation;
  }

  var resp_data = await exercise_preference_helper.get_exercise_preference_by_user_id({
    userId: authUserId
  });

  if (resp_data.status == 1) {
    let exercise_preference_data = await exercise_preference_helper.update_exercise_preference_by_userid(
      authUserId,
      exercise_preference_obj
    );
    if (exercise_preference_data.status === 0) {
      logger.error(
        "Error while updating exercise preferences = ",
        exercise_preference_data
      );
      res.status(config.BAD_REQUEST).json({
        exercise_preference_data
      });
    } else {
      res.status(config.OK_STATUS).json(exercise_preference_data);
    }
  } else if (resp_data.status == 2) {
    let exercise_preference_data = await exercise_preference_helper.insert_exercise_prefernece(
      exercise_preference_obj
    );
    if (exercise_preference_data.status === 0) {
      logger.error(
        "Error while inserting exercise preferences = ",
        exercise_preference_data
      );
      res.status(config.BAD_REQUEST).json({
        exercise_preference_data
      });
    } else {
      res.status(config.OK_STATUS).json(exercise_preference_data);
    }
  } else {
    res.status(config.INTERNAL_SERVER_ERROR).json(resp_data);
  }
});

/**
 * @api {get} /user/exercise_preference/reset Reset Exercise Preferences
 * @apiName Reset Exercise Preferences
 * @apiGroup User Exercise Preferences
 *
 * @apiHeader {String}  authorization user's unique access-key
 *
 * @apiSuccess (Success 200) {JSON} exercise_preference exercise_preference's document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get("/reset", async (req, res) => {
  var decoded = jwtDecode(req.headers["authorization"]);
  var authUserId = decoded.sub;
  logger.trace("Reset exercise preference API called : ", authUserId);
  let exercise_preference_data = await exercise_preference_helper.update_exercise_preference_by_userid(
    authUserId,
    constant.EXERCISE_PREFERENCE_DEFUALT_VALUE
  );
  if (exercise_preference_data.status === 1) {
    exercise_preference_data.message = "Reset Exercise preference";
    res.status(config.OK_STATUS).json(exercise_preference_data);
  } else {
    logger.error(
      "Error while reseting exercise preferences = ",
      exercise_preference_data
    );
    // exercise_preference_data.message="could not reset exercise preference";

    res.status(config.BAD_REQUEST).json({
      exercise_preference_data
    });
  }
});
module.exports = router;