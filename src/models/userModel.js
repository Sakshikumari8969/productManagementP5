const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
        trim:true
    },
    lname: {
        type: String,
        required: true,
        trim:true
    },
    email: {
        type: String,
        required: true,    //valid
        unique: true,
        trim:true
    },
    profileImage: {
        type: String,
        required: true,
        trim:true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim:true       //valid
    },
    password: {
        type: String,
        required: true,
        minLen: 8,
        maxLen: 15,
        trim:true            //hashing
    },
    address: {
        shipping: {
            street: {
                type: String,
                required: true,
                trim:true
            },
            city: {
                type: String,
                required: true,
                trim:true
            },
            pincode: {
                type: Number,
                required: true,
                trim:true
            }
        },
        billing: {
            street: {
                type: String,
                required: true,
                 trim:true
            },
            city: {
                type: String,
                required: true,
                trim:true
            },
            pincode: {
                type: String,
                required: true,
                trim:true
            }
        }
    }
}, { timestamps: true })

module.exports = mongoose.model("user", userSchema)