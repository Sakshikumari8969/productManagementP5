const mongoose = require("mongoose")
const objectId = mongoose.Schema.Types.ObjectId

const cartSchema = new mongoose.Schema({
    userId: {
        type: objectId,
        required: true,
        ref: "user"
    },
    items: [{
        productId: {
            type: objectId,
            required: true,
            ref: "product"
        },
        quantity: {
            type: Number,
            require: true
        },
        _id: false
    }],
    totalPrice: {
        type: Number,
        require: true
    },
    totalItems: {
        type: Number,
        require: true
    },
    __v: false

}, { timestamps: true })

module.exports = mongoose.model("cart", cartSchema);