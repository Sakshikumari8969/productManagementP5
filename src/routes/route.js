const express = require("express")
const router = express.Router()
const { authentication, authorization } = require("../middleware/middle")
const userController = require("../controller/userController")
const { productCreate, getproduct, getByIdProduct, updateProduct, deleteProduct } = require("../controller/productController")
const { createCart, updateCart, getCart, deleteCart } = require("../controller/cartController")
const { orderCreate, updateOrder } = require("../controller/orderController")

// ==================================USER ROUTE================================================

router.post("/register", userController.createUser);
router.post("/login", userController.loginUser);
router.get("/user/:userId/profile", authentication,authorization, userController.getUser);
router.put("/user/:userId/profile", authentication, authorization, userController.updateUser);

// ==================================PRODUCT ROUTE=============================================

router.post("/products", productCreate);
router.get("/products", getproduct);
router.get("/products/:productId", getByIdProduct);
router.put("/products/:productId", updateProduct);
router.delete("/products/:productId", deleteProduct);

// =================================CART ROUTE=================================================

router.post("/users/:userId/cart", authentication, authorization, createCart);
router.put("/users/:userId/cart", authentication, authorization, updateCart);
router.get("/users/:userId/cart", authentication, authorization, getCart);
router.delete("/users/:userId/cart", authentication, authorization, deleteCart);

// ====================================ORDER ROUTE========================================================

router.post("/users/:userId/orders", authentication, authorization, orderCreate);
router.put("/users/:userId/orders", authentication, authorization, updateOrder);

// ============================================================================================

router.all("/*", (req, res) => {
    res.status(400).send({ message: "Invalid path request " });
})

// ==================================EXPORT====================================================

module.exports = router;
