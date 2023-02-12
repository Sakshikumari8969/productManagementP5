const userModel = require("../models/userModel")
const { userJoi, loginJoi, updateJoi, isValidPincode } = require("../validation/joiValidation")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const { uploadFile } = require("../routes/aws")

// ==================================CREATE USER================================================

// POST /register
// Create a user document from request body. Request body must contain image.
// Upload image to S3 bucket and save it's public url in user document.
// Save password in encrypted format. (use bcrypt)
// Response format
// On success - Return HTTP status 201. Also return the user document. The response should be a JSON object like this
// On error - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like .

exports.createUser = async (req, res) => {
    try {
        let data = req.body
        let files = req.files
        let password = data.password
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Plz provide some data" })

        if (files && files.length > 0) {
            let uploadedFileURL = await uploadFile(files[0]);
            data.profileImage = uploadedFileURL
        } else {
            return res.status(400).send({ status: false, message: "No file found" });
        }

        if (!data.address) return res.status(400).send({ status: false, message: "address is required" })
        let address = JSON.parse(data.address);
        data.address = address;
        // console.log(data.address);
        // console.log(typeof (data.address))
        let pincodeShipping = data.address.shipping.pincode;
        if (!isValidPincode(pincodeShipping)) return res.status(400).send({ status: false, message: "pin code in shipping address is invalid" });
        let pincodeBilling = data.address.billing.pincode;
        if (!isValidPincode(pincodeBilling)) return res.status(400).send({ status: false, message: "pin code in  billing address  is invalid" });

        try {
            await userJoi.validateAsync(data)
        } catch (err) {
            return res.status(400).send({ message: err.message })
        }

        let findInDb = await userModel.findOne({ $or: [{ email: data.email.trim() }, { phone: data.phone.trim() }] })
        if (findInDb) {
            if (findInDb.email == data.email.trim()) return res.status(400).send({ status: false, message: "this email already exists" })
            if (findInDb.phone == data.phone.trim()) return res.status(400).send({ status: false, message: "this phone already exists" })
        }

        // passwordHashing :

        let saltRounds = 10
        let encryptPassword = await bcrypt.hash(password, saltRounds)
        data.password = encryptPassword

        let uCreate = await userModel.create(data)
        return res.status(201).send({ status: true, message: "User created successfully", data: uCreate })
    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}

// ==================================LOGIN USER================================================

// POST /login
// Allow an user to login with their email and password.
// On a successful login attempt return the userId and a JWT token contatining the userId, exp, iat.
// NOTE: There is a slight change in response body. You should also return userId in addition to the JWT token.
// Response format
// On success - Return HTTP status 200 and JWT token in response body. The response should be a JSON object like this
// On error - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like .

exports.loginUser = async function (req, res) {
    try {

        let data = req.body
        let { email, password } = data
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Please provide credential to login" })

        //email & password validation:

        try {
            await loginJoi.validateAsync(data)
        } catch (error) {
            return res.status(400).send({ message: error.message })
        }

        let exist = await userModel.findOne({ email: email.trim() })
        if (!exist) {
            return res.status(404).send({ status: false, message: "This credentials are not found" })
        } else {
            let hashedPassword = bcrypt.compareSync(password, exist.password)
            if (!hashedPassword) return res.status(401).send({ status: false, message: "This password is not valid" })

            let token = jwt.sign({ userId: exist._id }, "godKnowsthis", { expiresIn: "9h" })
            res.setHeader("authorization", token)
            return res.status(200).send({ status: true, message: "User login successfully", data: { userId: exist._id, token } })
        }
    }
    catch (error) {
        return res.status(500).send({ error: error.message })
    }
}

// ==================================GET USER===============================================

// GET /user/:userId/profile (Authentication required)
// Allow an user to fetch details of their profile.
// Make sure that userId in url param and in token is same
// Response format
// On success - Return HTTP status 200 and returns the user document. The response should be a JSON object like this
// On error - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like .

exports.getUser = async function (req, res) {
    try {

        let userId = req.params.userId
        if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).send({ status: false, message: "userId is not valid" })
           let findInDb = await userModel.findById(userId)
        if (!findInDb) return res.status(400).send({ status: false, message: "no user with this Id" })
        return res.status(200).send({ status: true, message: "User profile details", data: findInDb })
    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}

// ==================================UPDATE USER================================================

// PUT /user/:userId/profile (Authentication and Authorization required)
// Allow an user to update their profile.
// A user can update all the fields
// Make sure that userId in url param and in token is same
// Response format
// On success - Return HTTP status 200. Also return the updated user document. The response should be a JSON object like this
// On error - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like 

exports.updateUser = async (req, res) => {
    try {
        let userId = req.params.userId
        if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).send({ status: false, message: "userId is not valid" })

        let files = req.files
        let data = req.body
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "provide data to update" })
        let fileUrl;
        if (files && files.length > 0) {
            const uploadedFileURL = await uploadFile(files[0])
            fileUrl = uploadedFileURL;
        }
        data.profileImage = fileUrl
        let { fname, lname, email, profileImage, phone, password, address } = data

        if (data.address) {
            let address = JSON.parse(data.address)
            data.address = address
        }
        try {
            await updateJoi.validateAsync(data);
        } catch (err) {
            return res.status(400).send({ message: err.message });
        }

        let existInDb = await userModel.findOne({ _id: userId }).select({ id: 0, updatedAt: 0, createdAt: 0, __v: 0 }).lean()
        if (fileUrl) {
            existInDb.profileImage = fileUrl
        }
        if (data.password) {
            let password = data.password.trim()
            let encryptPassword = await bcrypt.hash(password, 10)
            data.password = encryptPassword
        }

        if (data.address) {
            if (data.address.billing) {
                if (data.address.billing.city) {
                    existInDb.address.billing.city == data.address.billing.city
                }
            }
        }

        if (data.address) {
            if (data.address.billing) {
                if (data.address.billing.street) {
                    existInDb.address.billing.street = data.address.billing.street
                }
            }
        }

        if (data.address) {
            if (data.address.billing) {
                if (data.address.billing.pincode) {
                    if (!isValidPincode(data.address.billing.pincode)) return res.status(400).send({ status: false, message: "please enter valid PIN" })
                    existInDb.address.billing.pincode == data.address.billing.pincode
                }
            }
        }
        if (data.address) {
            if (data.address.shipping) {
                if (data.address.shipping.city) {
                    existInDb.address.shipping.city == data.address.shipping.city
                }
            }
        }
        if (data.address) {
            if (data.address.shipping) {
                if (data.address.shipping.street) {
                    existInDb.address.shipping.street = data.address.shipping.street
                }
            }
        }

        if (data.address) {
            if (data.address.shipping) {
                if (data.address.shipping.pincode) {
                    if (!isValidPincode(data.address.shipping.pincode)) return res.status(400).send({ status: false, message: "please enter valid PIN" })
                    existInDb.address.shipping.pincode == data.address.shipping.pincode
                }
            }
        }

        let findInDb = await userModel.findOne({ $or: [{ email: email }, { phone: phone }] })
        if (findInDb) {
            if (findInDb.email == email) return res.status(400).send({ status: false, message: `this email ${email} already  in use ` })
            if (findInDb.phone == phone) return res.status(400).send({ status: false, message: `this phone ${phone}  already in use` })
        }
        const updateData = await userModel.findByIdAndUpdate(userId, { $set: { ...data } }, { new: true })
        return res.status(200).send({ status: true, message: "Success", data: updateData })

    } catch (error) {
        return res.status(500).send({ error: error.message })

    }}



/* ==================================================================================*/


