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
shopping_cart_helper.get_shopping_cart = async (id) => {
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




module.exports = shopping_cart_helper;