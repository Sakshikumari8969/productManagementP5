const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const mongoose = require("mongoose");
const { cartJoi, updateCartJoi } = require("../validation/joiValidation");

// ======================================CREATE CART==========================================

// POST /users/:userId/cart (Add to cart)
// Create a cart for the user if it does not exist. Else add product(s) in cart.
// Get cart id in request body.
// Get productId in request body.
// Make sure that cart exist.
// Add a product(s) for a user in the cart.
// Make sure the userId in params and in JWT token match.
// Make sure the user exist
// Make sure the product(s) are valid and not deleted.
// Get product(s) details in response body.
// Response format
// On success - Return HTTP status 201. Also return the cart document. The response should be a JSON object like this
// On error - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like this

exports.createCart = async (req, res) => {
  try {
    let data = req.body;
    let userId = req.params.userId;
    const { productId, cartId } = data;
    if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "empty body" });

    if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Invalid userId" });

    try {
      await cartJoi.validateAsync(data)
    } catch (error) {
      return res.status(400).send({ status: false, message: error.message })
    }

    if (cartId) {
      if (!mongoose.isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "not valid cartId" });
      let checkCart = await cartModel.findById(cartId)
      if (!checkCart) return res.status(404).send({ status: false, message: "cart does not exist" });
      if (checkCart.userId != userId) return res.status(400).send({ status: false, message: "cart is not of this user" });


    }
    if (productId) {
      if (!mongoose.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Invalid productId" });
      let checkProduct = await productModel.findById(productId)
      if (!checkProduct) return res.status(404).send({ status: false, message: "product does not exist" });

    }

    let cartExist = await cartModel.findOne({ userId: userId });
    if (!cartExist) {
      let productPrice = await productModel.findOne({ _id: productId, isDeleted: false });
      if (!productPrice) return res.status(404).send({ status: false, message: "product not found" });
      let totalPrice = 0;
      const newCart = {
        userId: userId,
        items: [
          {
            productId: productId,
            quantity: 1,
          },
        ],
        totalPrice: (totalPrice += productPrice.price),
        totalItems: 1,
      };

      let create = await cartModel.create(newCart);
      return res.status(201).send({ status: true, message: "Success", data: create });
    } else {
      let totalPrice = cartExist.totalPrice;

      const product = await productModel.findOne(
        { _id: productId },
        { isDeleted: false }
      );
      totalPrice += product.price;

      let quantity = 1;
      for (let item of cartExist.items) {
        // console.log(item)
        if (item.productId.toString() == productId.toString()) {

          quantity = item.quantity + 1
          item.quantity = quantity
        }
      }
      if (quantity === 1) {
        let newItem = {
          productId: productId,
          quantity: quantity
        }
        cartExist.items.push(newItem)
      }
      let updateCart = {
        items: cartExist.items,
        totalPrice: totalPrice,
        totalItems: cartExist.items.length,
      };

      const createCart = await cartModel.findOneAndUpdate({ _id: cartExist._id }, { $set: updateCart }, { new: true }).populate({ path: "items.productId", model: "product", select: ["title", "price", "currencyFormat", "description", "productImage"] });
      return res.status(201).send({ status: true, message: "Success", data: createCart })
    }
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//  ======================================UPDATE CART==========================================

// PUT /users/:userId/cart (Remove product / Reduce a product's quantity from the cart)
// Updates a cart by either decrementing the quantity of a product by 1 or deleting a product from the cart.
// Get cart id in request body.
// Get productId in request body.
// Get key 'removeProduct' in request body.
// Make sure that cart exist.
// Key 'removeProduct' denotes whether a product is to be removed({removeProduct: 0}) or its quantity has to be decremented by 1({removeProduct: 1}).
// Make sure the userId in params and in JWT token match.
// Make sure the user exist
// Get product(s) details in response body.
// Check if the productId exists and is not deleted before updating the cart.
// Response format
// On success - Return HTTP status 200. Also return the updated cart document. The response should be a JSON object like this
// On error - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like this

exports.updateCart = async (req, res) => {
  try {
    const data = req.body;
    let { cartId, productId, removeProduct } = data;
    let userId = req.params.userId
    if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "This is invalid userId" });

    if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Body can't be empty" });

    try {
      await updateCartJoi.validateAsync(data)
    } catch (error) {
      return res.status(400).send({ status: false, message: error.message })
    }
    if (!mongoose.isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "This is invalid CartId" });
    if (!mongoose.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "This is invalid ProductId" });

    const getCart = await cartModel.findById(cartId);
    if (!getCart) return res.status(404).send({ status: false, message: "no cart found" });
    if (getCart.userId != userId) return res.status(400).send({ status: false, message: "cart is not of this user" });
    // console.log((getCart.items));

    let removeItem;
    let items = getCart.items;
    for (let item in items) {

      if (items[item].productId.toString() == productId.toString()) {
        //   //   console.log(removeProduct)
        if (removeProduct === 0) {
          removeItem = items.splice(item, 1);
          //     console.log(items);
          break;
        }
        if (removeProduct == 1 && items[item].quantity >= 1) {
          if (items[item].quantity == 1) {
            removeItem = items.splice(item, 1);
            break;
          }
          items[item].quantity -= 1;
          removeItem = items[item];
          // console.log(removeItem);
          break;
        }
      }
    }
    let producttId, Quantity
    if (Array.isArray(removeItem)) {
      producttId = removeItem[0]?.productId
      Quantity = removeItem[0]?.quantity
    } else {
      producttId = removeItem?.productId
      Quantity = removeItem?.quantity
    }
    if (!producttId) {
      return res.status(400).send({ status: false, message: "no product present to remove" })
    };

    let productTORemove = await productModel.findById(producttId);
    if (!productTORemove)
      return res.status(404).send({ status: false, message: "Product is not found" });
    // console.log(getCart.totalPrice)
    // console.log(productTORemove.price)
    let totalPrice = getCart.totalPrice - (productTORemove.price * Quantity);
    // console.log(totalPrice);
    let totalItems = getCart.items.length;
    let updateCart = await cartModel.findOne({ _id: cartId });
    updateCart.totalPrice = totalPrice
    updateCart.totalItems = totalItems
    updateCart.items = items

    await updateCart.save();
    let nextUpdate = await cartModel.findOne({ _id: cartId }).populate({ path: "items.productId", model: "product", select: ["title", "price", "currencyFormat", "description", "productImage"] })

    return res.status(200).send({ status: true, message: "Success", data: nextUpdate });

  } catch (error) {
    return res.status(500).send({ Status: false, message: error.message });
  }
};


// ======================================GET CART==========================================

// GET /users/:userId/cart
// Returns cart summary of the user.
// Make sure that cart exist.
// Make sure the userId in params and in JWT token match.
// Make sure the user exist
// Get product(s) details in response body.
// Response format
// On success - Return HTTP status 200. Return the cart document. The response should be a JSON object like this
// On error - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like this

exports.getCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "invalid userId" });
    //neto checkproductid 
    let getCartData = await cartModel.findOne({ userId }).populate({
      path: "items.productId", model: "product",
      select: [
        "title",                                                   //from product model
        "price",
        "currencyFormat",
        "description",
        "productImage",
      ]
    });
    if (!getCartData) return res.status(404).send({ status: false, message: "cart is empty" });
    return res.status(200).send({ status: true, message: "Success", data: getCartData });

  } catch (err) {
    return res.status(500).send({ Status: false, message: err.message });
  }
};

// ======================================DELETE CART=========================================

// DELETE /users/:userId/cart
// Deletes the cart for the user.
// Make sure that cart exist.
// Make sure the userId in params and in JWT token match.
// Make sure the user exist
// cart deleting means array of items is empty, totalItems is 0, totalPrice is 0.
// Response format
// On success - Return HTTP status 204. Return a suitable message. The response should be a JSON object like this
// On error - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like this

exports.deleteCart = async (req, res) => {
  try {
    let userId = req.params.userId;
    if (!userId) return res.status(400).send({ status: false, message: "no userId in the params" })
    if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "invalid userId" })

    let cartData = await cartModel.findOne({ userId });
    if (!cartData) return res.status(404).send({ status: false, message: 'Cart does not exist' });
    if (cartData.totalItems == 0) return res.status(404).send({ status: false, message: 'cart is already empty' });

    await cartModel.findOneAndUpdate({ userId }, { items: [], totalPrice: 0, totalItems: 0 });
    return res.status(204).send({ status: true, message: "Success" });
  }

  catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
}


// ================================================================================

