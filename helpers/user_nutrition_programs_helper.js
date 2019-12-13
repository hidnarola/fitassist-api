var _ = require("underscore");
const mongoose = require("mongoose");
const moment = require("moment");
var UserNutritionProgram = require("./../models/user_nutrition_programs");

var user_nutrition_programs_helper = {};

user_nutrition_programs_helper.add_user_nutrition_program_data = async obj => {
  let user_nutrition_program = new UserNutritionProgram(obj);
  try {
    let user_program_data = await user_nutrition_program.save();

    return {
      status: 1,
      message: "User nutrition program inserted",
      program: user_program_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while insert user nutrition program",
      error: err
    };
  }
};

user_nutrition_programs_helper.update_user_nutrition_program_data = async (
  condition,
  obj
) => {
  try {
    let user_program_data = await UserNutritionProgram.findOneAndUpdate(
      condition,
      obj,
      { new: true }
    );

    return {
      status: 1,
      message: "User nutrition program updated",
      program: user_program_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while updating user nutrition program",
      error: err
    };
  }
};

user_nutrition_programs_helper.get_all_user_nutrition_programs = async (
  condition,
  start,
  limit
) => {
  try {
    var resp_data = await UserNutritionProgram.aggregate([
      {
        $match: condition
      },
      {
        $lookup: {
          from: "user_nutrition_programs_meals",
          localField: "_id",
          foreignField: "programId",
          as: "meals"
        }
      },
      { $addFields: { total_meals: { $size: "$meals" } } },
      { $addFields: { max_day: { $max: "$meals.day" } } },
      { $addFields: { min_day: { $min: "$meals.day" } } },
      {
        $project: {
          meals: 0
        }
      },
      {
        $skip: start
      },
      {
        $limit: limit
      }
    ]);
    return {
      status: 1,
      message: "user nutrition program found",
      programs: resp_data
    };
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user nutrition program",
      error: err
    };
  }
};
user_nutrition_programs_helper.get_user_nutrition_programs_in_details = async condition => {
  try {
    var user_nutrition_program = await UserNutritionProgram.aggregate([
      {
        $match: condition
      },
      {
        $lookup: {
          from: "user_nutrition_programs_meals",
          localField: "_id",
          foreignField: "programId",
          as: "meals"
        }
      },
      {
        $unwind: "$meals"
      },
      {
        $group: {
          _id: "$meals.day",
          day: { $first: "$meals.day" },
          _id2: { $first: "$_id" },
          meals: { $addToSet: "$meals" },
          privacy: { $first: "$privacy" },
          level: { $first: "$level" },
          tags: { $first: "$tags" },
          categories: { $first: "$categories" },
          name: { $first: "$name" },
          description: { $first: "$description" },
          userId: { $first: "$userId" },
          type: { $first: "$type" },
          createdAt: { $first: "$createdAt" },
          modifiedAt: { $first: "$modifiedAt" }
        }
      },
      {
        $project: {
          _id: "$_id2",
          meals: 1,
          privacy: 1,
          level: 1,
          tags: 1,
          categories: 1,
          name: 1,
          description: 1,
          userId: 1,
          type: 1,
          createdAt: 1,
          modifiedAt: 1,
          day: 1
        }
      }
    ]);

    if (user_nutrition_program && user_nutrition_program.length > 0) {
      var programs =
        user_nutrition_program.length > 0
          ? user_nutrition_program.map(({ day, meals }) => ({
              day,
              meals
            }))
          : [];
      var program = {
        privacy: user_nutrition_program[0].privacy,
        level: user_nutrition_program[0].level,
        tags: user_nutrition_program[0].tags,
        categories: user_nutrition_program[0].categories,
        name: user_nutrition_program[0].name,
        description: user_nutrition_program[0].description,
        userId: user_nutrition_program[0].userId,
        type: user_nutrition_program[0].type,
        _id: user_nutrition_program[0]._id,
        createdAt: user_nutrition_program[0].createdAt,
        modifiedAt: user_nutrition_program[0].modifiedAt,
        programs: programs
      };

      return {
        status: 1,
        message: "user nutrition program found",
        program: program
      };
    } else {
      var program_resp = await findUserNutritionProgram(condition);
      console.log("===========Program Resp===========");
      console.log("Program Resp", program_resp);
      console.log("==========================");
      if (program_resp.status === 1) {
        var newProgram = program_resp.program;
        newProgram["programs"] = [];
        return {
          status: 1,
          message: "user nutrition program found",
          program: newProgram
        };
      } else {
        return {
          status: 2,
          message: "No user nutrition program available"
        };
      }
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user nutrition program",
      error: err
    };
  }
};

const findUserNutritionProgram = async condition => {
  try {
    let resp_data = await UserNutritionProgram.findOne(condition);
    if (resp_data) {
      return {
        status: 1,
        message: "user nutrition program found",
        program: resp_data
      };
    } else {
      return {
        status: 2,
        message: "user nutrition program not found"
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user nutrition program",
      error: err
    };
  }
};

user_nutrition_programs_helper.get_user_nutrition_programs_by_id = async condition => {
  try {
    let resp_data = await UserNutritionProgram.findOne(condition);
    if (resp_data) {
      return {
        status: 1,
        message: "user nutrition program found",
        program: resp_data
      };
    } else {
      return {
        status: 2,
        message: "user nutrition not program found",
        program: null
      };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occured while finding user nutrition program",
      error: err
    };
  }
};

module.exports = user_nutrition_programs_helper;
