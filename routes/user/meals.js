var express = require("express");
var fs = require("fs");
var path = require("path");
var router = express.Router();
var config = require("../../config");
var logger = config.logger;
var meals_helper = require("../../helpers/meals_helper");
var common_helper = require("../../helpers/common_helper");
var jwtDecode = require("jwt-decode");

//  post meal
router.post("/", async (req, res) => {
    var decoded = jwtDecode(req.headers["authorization"]);
    var authUserId = decoded.sub;
    var schema = {
      title: {
        notEmpty: true,
        isLength: {
          errorMessage: 'title should be between 2 to 50 characters',
          options: {
            min: 2,
            max: 50
          }
        },
        errorMessage: "title of meal is required"
      },
      meals_type: {
        notEmpty: true,
        errorMessage: "meals type is required"
      },
      meals_visibility: {
        notEmpty: true,
        errorMessage: "meals_visibility is required"
      },
      ingredientsIncluded : {
        notEmpty: true,
        errorMessage: "ingredients is required"
      }
    };


    if(req.body.meals_visibility && req.body.meals_visibility === 'public') {
        schema.instructions = {
            notEmpty: true,
            errorMessage: "Instruction is required"
        }
    }
    req.checkBody(schema);
    var errors = req.validationErrors();
  
    if (!errors) {
        console.log('req.body.ingredientsIncluded => ',req.body.ingredientsIncluded);
      var meals_obj = {

        title: req.body.title,
        notes: req.body.notes,
        meals_type: req.body.meals_type,
        meals_visibility: req.body.meals_visibility,
        instructions: req.body.instructions,
        ingredientsIncluded: req.body.ingredientsIncluded,
        userId: authUserId,
      };


      
      //image upload
      var filename;
      if (req.files && req.files["meal_img"]) {
        var file = req.files["meal_img"];
        var dir = "./uploads/meal";
        var mimetype = ["image/png", "image/jpeg", "image/jpg"];
  
        if (mimetype.indexOf(file.mimetype) != -1) {
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
          }
          extention = path.extname(file.name);
          filename = "meal_" + new Date().getTime() + extention;
          file.mv(dir + "/" + filename, function (err) {
            if (err) {
              logger.error("There was an issue in uploading image");
              res.send({
                status: config.MEDIA_ERROR_STATUS,
                err: "There was an issue in uploading image"
              });
            } else {
                meals_obj.image = "uploads/meal/" + filename;  
              logger.trace("image has been uploaded. Image name = ", filename);
              //return res.send(200, "null");
            }
          });
        } else {
          logger.error("Image format is invalid");
          res.send({
            status: config.VALIDATION_FAILURE_STATUS,
            err: "Image format is invalid"
          });
        }
      } else {
        logger.info("Image not available to upload. Executing next instruction");
        //res.send(config.MEDIA_ERROR_STATUS, "No image submitted");
      }
  


      // insert recent ingredient
      let meal_data = await meals_helper.insert_meal(meals_obj);
      if (meal_data.status === 0) {
        logger.error("Error while inserting meal data = ", meal_data);
        return res.status(config.BAD_REQUEST).json({
          meal_data
        });
      } else {
          
        // insert recent ingredient

//         var find_ingredient= await Ingredient.countDocument({"user_id":"enqwfkrte"})
// if(find_ingredient <10){
//     var ingredient_id=req.body.ingredientsIncluded
//     var find_ingredientsf= await Ingredient.find({"user_id":"enqwfkrte","":{$in:{ingredient_id}})
//     if(find_ingredientsf ==null)
//     {
// // insert
//     }
// }


//   else if{
//     var find_ingredient= await Ingredient.countDocument({"user_id":"enqwfkrte"})
//     if(find_ingredient <10){
//         var ingredient_id=req.body.ingredientsIncluded
//         var find_ingredientsf= await Ingredient.find({"user_id":"enqwfkrte","":{$in:{ingredient_id}})
//         if(find_ingredientsf ==null)
//         {
//             //delete
//     //insert
//         }
//     }
//   }

        return res.status(config.OK_STATUS).json(meal_data);
      }

    } else {
      logger.error("Validation Error = ", errors);
      res.status(config.VALIDATION_FAILURE_STATUS).json({
        message: errors
      });
    }
  });


module.exports = router;