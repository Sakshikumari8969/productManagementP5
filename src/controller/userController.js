const userModel = require("../models/userModel")
const Joi = require("joi")
const { userJoi, loginJoi, updateJoi, isValidPincode } = require("../validation/joiValidation")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { default: mongoose } = require("mongoose")
// const P = require("pincode-validator")
let aws = require("aws-sdk")
const { uploadFile } = require("../routes/aws")

const createUser = async (req, res) => {
    try {
        let files = req.files
        let data = req.body
        let password = data.password
        // let address = data.address.shipping.pincode
        // P.validate(address)

        if (Object.keys(data).length == 0) return res.status(400).send({ message: "plz provide some data" })

        let address = JSON.parse(data.address);
        data.address = address;
        let pincodeShipping = data.address.shipping.pincode;
        let pincodeBilling = data.address.billing.pincode;
        if (!isValidPincode(pincodeShipping) || !isValidPincode(pincodeBilling))
            return res.status(400).send({ status: false, message: "pin code in shipping address and in  billing address  is invalid" });

        try {
            await userJoi.validateAsync(data)
        } catch (err) {
            return res.status(400).send({ message: err.message })
        }
        let findInDb = await userModel.findOne({ $or: [{ email: data.email.trim() }, { phone: data.phone.trim() }] })
        if (findInDb) {
            if (findInDb.email == data.email.trim()) return res.status(400).send({ message: "this email already exists" })
            if (findInDb.phone == data.phone.trim()) return res.status(400).send({ message: "this phone already exists" })
        }

        if (files && files.length > 0) {
            let uploadedFileURL = await uploadFile(files[0]);
            data.profileImage = uploadedFileURL;
        } else {
            return res.status(400).send({ msg: "No file found" });
        }
        let saltRounds = 10
        let salt = await bcrypt.genSalt(saltRounds)
        let hash = await bcrypt.hash(password, salt)
        data.password = hash

        let uCreate = await userModel.create(data)
        return res.status(201).send({ status: true, message: "User created successfully", data: uCreate })
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
}


const loginUser = async function (req, res) {
    try {
        let data = req.body
        let { email, password } = data
        if (Object.keys(data).length == 0) return res.status(400).send({ message: "empty body" })
        try {
            await loginJoi.validateAsync(data)
        } catch (error) {
            return res.status(400).send({ message: error.message })
        }
        let exist = await userModel.findOne({ email: email.trim() })
        if (!exist) {
            return res.status(404).send({ message: "this credential not found" })
        } else {
            let hashedPassword = bcrypt.compareSync(password, exist.password)
            if (!hashedPassword) return res.status(400).send({ message: "u are not correct person" })
            let token = jwt.sign({ userId: exist._id }, "groupIsGood", { expiresIn: "9h" })
            res.setHeader("x-api-key", token)
            return res.status(200).send({ status: true, message: "User login successfully", data: { userId: exist._id, token } })
        }
    }
    catch (error) {
        return res.status(500).send({ message: error.message })
    }
}

const getUser = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).send({ message: "userId is not correct" })
        // if(userId!=token._id) return res.status(401).send({message:"userId should same in params and token"})
        let findInDb = await userModel.findById(userId)
        if (!findInDb) return res.status(400).send({ message: "no user with this Id" })
        return res.status(200).send({ status: true, message: "User profile details", data: findInDb })
    }
    catch (error) {
        return res.status(500).send({ message: error.message })
    }
}

const updateUser = async function (req, res) {
    try {
        let files = req.files
        let data = req.body
        if (Object.keys(data).length == 0) return res.status(400).send({ message: "empty body" })
        let userId = req.params.userId
        if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).send({ message: "userId is not valid" })

        let fileUrl;
        if (files && files.length > 0) {
            const uploadedFileURL = await uploadFile(files[0])
            fileUrl = uploadedFileURL;
        } data.profileImage = fileUrl

        if (data.address) {
            let address = JSON.parse(data.address)
            data.address = address
        }

        try {
            await updateJoi.validateAsync(data);
        } catch (err) {
            return res.status(400).send({ msg: err.message });
        }


        let existInDb = await userModel.findOne({ _id: userId }).select({ id: 0, updatedAt: 0, createdAt: 0, __v: 0 }).lean()

        if (fileUrl) {
            existInDb.profileImage = fileUrl
        }

        if (data.password) {
            const salt = bcrypt.genSaltSync(10);
            const codePass = bcrypt.hashSync(req.body.password, salt);
            data.password = codePass;
        }
        if (data.address) {
            if (data.address.billing) {
                if (data.address.billing.city) {
                    existInDb.address.billing.city == data.address.billing.city
                }}}
                
        if (data.address) {
            if (data.address.billing) {
                if (data.address.billing.street) {
                    existInDb.address.billing.street = data.address.billing.street
                }}}

        if (data.address) {
            if (data.address.billing) {
                if (data.address.billing.pincode) {
                    if (!isValidPincode(data.address.billing.pincode)) return res.status(400).send({ status: false, message: "please enter valid PIN" })
                    existInDb.address.billing.pincode == data.address.billing.pincode
                }}}
        if (data.address) {
            if (data.address.shipping) {
                if (data.address.shipping.city) {
                    existInDb.address.shipping.city == data.address.shipping.city
                }}}
        if (data.address) {
            if (data.address.shipping) {
                if (data.address.shipping.street) {
                    existInDb.address.shipping.street = data.address.shipping.street
                }}}

        if (data.address) {
            if (data.address.shipping) {
                if (data.address.shipping.pincode) {
                    if (!isValidPincode(data.address.shipping.pincode)) return res.status(400).send({ status: false, message: "please enter valid PIN" })
                    existInDb.address.shipping.pincode == data.address.shipping.pincode
                }}}
        let email = req.body.email
        let phone = req.body.phone

        // let {address,fname,lname,email,profileImage,phone,password}=data
        let findInDb = await userModel.findOne({ $or: [{ email: email, phone: phone }] })
        if (findInDb) {
            if (findInDb.email == req.body.email.trim()) return res.status(400).send({ message: "this email already there u cann't update with that" })
            if (findInDb.phone == req.body.phone.trim()) return res.status(400).send({ message: "this phone already there u cann't update with that" })
        }
        if (data.password) {
            let saltRounds = 10
            let salt = await bcrypt.genSalt(saltRounds)
            let hash = await bcrypt.hash(req.body.password, salt)
            data.password = hash
        }
        const updateData = await userModel.findByIdAndUpdate(userId, { $set: { ...data } }, { new: true })
        return res.status(400).send({ status: true, message: "User profile updated", data: updateData })
    } catch (error) {
        return res.status(500).send({ message: error.message })

    }}


module.exports = { createUser, loginUser, getUser, updateUser };

