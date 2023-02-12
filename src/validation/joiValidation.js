const Joi = require("joi")

// ==================================USER JOI================================================

const userJoi = Joi.object({
    fname: Joi.string().min(3).max(30).trim().required().regex(/^[a-zA-Z.]+$/).message("please provide valid fname"),
    lname: Joi.string().min(3).max(30).trim().required().regex(/^[a-zA-Z.]+$/).message("plz. provide valid lname"),
    email: Joi.string().trim().required().email().message("please provide valid email"),
    profileImage: Joi.string().valid().required(),
    phone: Joi.string().trim().required().regex(/^((91)|(\+91)|0?)[6789]{1}\d{9}$/).message("plz. give valid mobile number"),
    password: Joi.string().trim().required().min(8).max(15),
    address: Joi.object({
        shipping: Joi.object({
            street: Joi.string().trim().required(),
            city: Joi.string().trim().required().regex(/^[a-zA-Z.]+$/),
            pincode: Joi.number().required()
        }),
        billing: Joi.object({
            street: Joi.string().trim().required(),
            city: Joi.string().trim().required().regex(/^[a-zA-Z.]+$/),
            pincode: Joi.number().required()
        })
    })
});

// ==================================PINCODE VALIDATION================================================

const isValidPincode = (value) => {
    const regEx = /^\s*([0-9]){6}\s*$/;
    const result = regEx.test(value);
    return result
};

// ==================================LOGIN JOI================================================

const loginJoi = Joi.object({
    email: Joi.string().trim().required().regex(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).message("please enter valid email"),

    password: Joi.string().trim().required().min(8).max(15).message("please enter valid password")
    //    regex(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/)
});

// ==================================UPDATE JOI================================================

const updateJoi = Joi.object({
    fname: Joi.string().optional().regex(/^[a-zA-Z. ]+$/).message("please enter valid fname"),
    lname: Joi.string().optional().regex(/^[a-zA-Z. ]+$/).message("please enter valid lname"),
    email: Joi.string().trim().optional().regex(/^[A-Za-z0-9._]{3,}@[A-Za-z]{3,}[.]{1,}[A-Za-z.]{2,8}$/).message("please enter valid email"),
    profileImage: Joi.string().trim().valid().optional(),
    phone: Joi.string().trim().optional().regex(/^((91)|(\+91)|0?)[6789]{1}\d{9}$/).message("please enter valid mobile number"),
    password: Joi.string().min(8).max(15).trim().optional(),
    address: Joi.object({
        shipping: Joi.object({
            street: Joi.string().trim().optional(),
            city: Joi.string().trim().optional().regex(/^[a-zA-Z.]+$/),
            pincode: Joi.number().optional()
        }),
        billing: Joi.object({
            street: Joi.string().optional(),
            city: Joi.string().optional().regex(/^[a-zA-Z.]+$/),
            pincode: Joi.number().optional()
        })
    })
});

// ==================================PRODUCT CREATION JOI================================================

const proCreateJoi = Joi.object({
    title: Joi.string().trim().required(),
    description: Joi.string().trim().required(),
    price: Joi.number().valid().required(),
    currencyId: Joi.string().trim().required().valid("INR"),
    currencyFormat: Joi.string().trim().required().valid("₹"),
    isFreeShipping: Joi.boolean().optional(),
    productImage: Joi.string().trim().required(),
    style: Joi.string().trim().optional(),
    availableSizes: Joi.string().trim().required().optional("S", "XS", "M", "X", "L", "XXL", "XL"),
    installments: Joi.number(),
    deletedAt: Joi.date(),
    isDeleted: Joi.boolean().optional()
})

// ==================================UPDATE PRODUCT JOI================================================

const updateProJoi = Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    price: Joi.number().valid().optional(),
    currencyId: Joi.string().valid("INR").optional(),
    currencyFormat: Joi.string().valid("₹").optional(),
    isFreeShipping: Joi.boolean().optional(),
    productImage: Joi.string().valid().optional(),
    style: Joi.string().optional(),
    availableSizes: Joi.string().valid("S", "XS", "M", "X", "L", "XXL", "XL").optional(),
    installments: Joi.number().optional(),
    deletedAt: Joi.date().optional()
    // isDeleted: Joi.boolean().optional()
});

// ================================GET BY QUERY PRODUCT==================================================


const getProductByQuery = Joi.object({
    size: Joi.string().optional(),
    name: Joi.string().optional(),
    priceGreaterThan: Joi.number().optional(),
    priceLessThan: Joi.number().optional(),
    priceSort: Joi.number().optional().valid(1, -1)

})

// ==================================CART CREATE================================================


const cartJoi = Joi.object({
    productId: Joi.string().required(),
    cartId: Joi.string().optional()
})

// ==================================UPDATE CART JOI================================================


const updateCartJoi = Joi.object({
    productId: Joi.string().required(),
    cartId: Joi.string().required(),
    removeProduct: Joi.number().strict().valid(1, 0).required()
})

// ==================================EXPORTS========================================================

module.exports = { userJoi, loginJoi, updateJoi, isValidPincode, proCreateJoi, getProductByQuery, updateProJoi, cartJoi, updateCartJoi }

