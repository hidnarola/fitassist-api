var ShoppingCart = require("./../models/shopping_cart");
var shopping_cart_helper = {};

/*
 * get_all_shoppingcart is used to fetch all shopping cart data
 * 
 * @return  status 0 - If any internal error occured while fetching shopping cart data, with error
 *          status 1 - If shopping cart data found, with shopping cart object
 *          status 2 - If shopping cart not found, with appropriate message
 * 
 * @developed by "amc"

 */
shopping_cart_helper.get_all_shoppingcart = async (id) => {
    try {
        var shopping_cart = await ShoppingCart.find(id);
        if (shopping_cart) {
            return { "status": 1, "message": "shopping cart found", "shopping_carts": shopping_cart };
        } else {
            return { "status": 2, "message": "No shopping cart available" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while finding shopping cart", "error": err }
    }
}

/*
 * shopping_cart_id is used to fetch shopping cart by ID
 * 
 * @return  status 0 - If any internal error occured while fetching shopping cart data, with error
 *          status 1 - If shopping cart data found, with shopping cart object
 *          status 2 - If shopping cart  not found, with appropriate message
 * 
 * @ developed by "amc"
 */
shopping_cart_helper.get_shopping_cart_id = async (id) => {
    try {
        var shopping_cart = await ShoppingCart.findOne(id);
        if (shopping_cart) {
            return { "status": 1, "message": "Shopping Cart  found", "shopping_cart": shopping_cart };
        } else {
            return { "status": 2, "message": "No Shopping Cart available" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while finding Shopping Cart", "error": err }
    }
}

/*
 * insert_shopping_cart is used to insert into shoppingcart collection
 * 
 * @param   shopping_cart_object     JSON object consist of all property that need to insert in shoppingcart collection
 * 
 * @return  status  0 - If any error occur in inserting shopping cart, with error
 *          status  1 - If shopping cart inserted, with inserted shoppingcart document and appropriate message
 * 
 * @developed by "amc"
 */
shopping_cart_helper.insert_shopping_cart = async (shopping_cart_object) => {
    console.log(shopping_cart_object);
    let shoppingcart = new ShoppingCart(shopping_cart_object);
    try {
        let shoppingcart_data = await shoppingcart.save();
        return { "status": 1, "message": "shopping cart inserted", "shopping_cart": shoppingcart_data };
    } catch (err) {
        return { "status": 0, "message": "Error occured while inserting shopping cart", "error": err };
    }
};

/*
 * update_shopping_cart_by_id is used to update shopping cart data based on shopping_cart_id
 * 
 * @param   shopping_cart_id         String  _id of shopping cart that need to be update
 * @param   shopping_cart_object     JSON    object consist of all property that need to update
 * 
 * @return  status  0 - If any error occur in updating shopping cart, with error
 *          status  1 - If shopping cart updated successfully, with appropriate message
 *          status  2 - If shopping cart not updated, with appropriate message
 * 
 * @developed by "amc"
 */
shopping_cart_helper.update_shopping_cart_by_id = async (id, shopping_cart_object) => {
    try {
        let shoppingcart_data = await ShoppingCart.findOneAndUpdate(id, shopping_cart_object, { new: true });
        if (!shoppingcart_data) {
            return { "status": 2, "message": "Record has not updated" };
        } else {
            return { "status": 1, "message": "Record has been updated", "shopping_cart": shoppingcart_data };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while updating shopping cart", "error": err }
    }
};

/*
 * delete_shopping_cart_by_id is used to delete shopping cart from database
 * 
 * @param   shopping_cart_id String  _id of shopping cart that need to be delete
 * 
 * @return  status  0 - If any error occur in deletion of shopping cart, with error
 *          status  1 - If shopping cart deleted successfully, with appropriate message
 * 
 * @developed by "amc"
 */
shopping_cart_helper.delete_shopping_cart_by_id = async (id) => {
    try {
        let resp = await ShoppingCart.findOneAndRemove(id);
        if (!resp) {
            return { "status": 2, "message": "shopping cart not found" };
        } else {
            return { "status": 1, "message": "shopping cart deleted" };
        }
    } catch (err) {
        return { "status": 0, "message": "Error occured while deleting shopping cart", "error": err };
    }
}

module.exports = shopping_cart_helper;