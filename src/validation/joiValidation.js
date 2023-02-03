const Joi = require("joi")
// let {pincode}=req.body.pincode

const userJoi = Joi.object({
    fname:Joi.string().min(3).max(30).trim().required().regex(/^[a-zA-Z.]+$/).message("please provide valid fname"),
    lname:Joi.string().min(3).max(30).trim().required().regex(/^[a-zA-Z\s]+$/).message("plz. provide valid lname"),
    email:Joi.string().trim().required().email().message("please provide valid email"),
    profileImage:Joi.string().valid(),
    phone: Joi.string().trim().required().regex(/^[0]?[6789]\d{9}$/).message("plz. give valid mobile number"),
    password: Joi.string().trim().required().min(8).max(15),
    address: Joi.object({
        shipping:Joi.object({
            street: Joi.string().trim().required(),
            city: Joi.string().trim().required().regex(/^[a-zA-Z\s]+$/),
            pincode:Joi.number().required()
        }),
        billing: Joi.object({
            street: Joi.string().trim().required(),
            city: Joi.string().trim().required().regex(/^[a-zA-Z\s]+$/),
            pincode:Joi.number().required()     
        })
    })});

    const isValidPincode = (value) => {
        const regEx = /^\s*([0-9]){6}\s*$/;
        const result = regEx.test(value);
        return result
    };


const loginJoi=Joi.object({
    email: Joi.string().trim().required().regex(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).message("please enter valid email"),

    password: Joi.string().trim().required().min(8).max(15).regex(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/).message("please enter valid password")

});

const updateJoi=Joi.object({
    fname:Joi.string().optional() .regex(/^[a-zA-Z. ]+$/)
    .message("please enter valid fname"),
    lname:Joi.string().optional().regex(/^[a-zA-Z. ]+$/)
    .message("please enter valid lname"),
    email:Joi.string().trim().optional() .regex(/^[A-Za-z0-9._]{3,}@[A-Za-z]{3,}[.]{1,}[A-Za-z.]{2,8}$/)
    .message("please enter valid email"),
    profileImage:Joi.string().trim().valid().optional(),
    phone: Joi.string().trim().optional().regex(/^[5-9]{1}[0-9]{9}$/)
    .message("please enter valid mobile number"),
    password: Joi.string().min(8).max(15).trim().optional(),
    address:Joi.object({
        shipping:Joi.object({
            street:Joi.string().optional(),
            city:Joi.string().optional(),
            pincode:Joi.number().optional()
        }),
        billing:Joi.object({
            street:Joi.string().optional(),
            city:Joi.string().optional(),
            pincode:Joi.number().optional()
        })
})});

// const isValidPincode = (value) => {
//     const regEx = /^\s*([0-9]){6}\s*$/;
//     const result = regEx.test(value);
//     return result
// };

module.exports = { userJoi ,loginJoi,updateJoi, isValidPincode}