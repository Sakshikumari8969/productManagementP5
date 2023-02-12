const mongoose = require("mongoose")
const productModel = require("../models/productModel")
const { proCreateJoi, updateProJoi, isValidAvailableSizes, getProductByQuery } = require("../validation/joiValidation")
const { uploadFile } = require("../routes/aws")

// =====================================PRODUCT CREATE=============================================

// POST /products
// Create a product document from request body.
// Upload product image to S3 bucket and save image public url in document.
// Response format
// On success - Return HTTP status 201. Also return the product document. The response should be a JSON object like this
// On error - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like 

exports.productCreate = async function (req, res) {
  try {
    let data = req.body
    if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Please provide data to create " })
    let files = req.files

    let fileUrl;
    if (files && files.length > 0) {
      let uploadedFileURL = await uploadFile(files[0])
      fileUrl = uploadedFileURL
    } else {
      return res.status(400).send({ status: false, message: "no file found" })
    }
    data.productImage = fileUrl

    try {
      await proCreateJoi.validateAsync(data)
    } catch (error) {
      return res.status(400).send({ status: false, message: error.message })
    }

    let { availableSizes } = data
    if (availableSizes) {
      let size = availableSizes.toUpperCase().split(",")
      // console.log(size)
      size = [...new Set(size)]
      let enumValue = ["S", "XS", "M", "X", "L", "XXL", "XL"]
      let actualSize = []
      for (let i of size) {
        if (enumValue.includes(i)) {
          actualSize.push(i)
        }
      }
      data.availableSizes = actualSize
    }

    let existInDb = await productModel.findOne({ title: data.title }, { isDeleted: false })
    if (existInDb) return res.status(400).send({ status: false, message: "this title is already in use" })

    let proCreate = await productModel.create(data)
    // delete proCreate["__v"]
    return res.status(201).send({ status: true, message: "Success", data: proCreate })

  } catch (error) {
    return res.status(500).send({ error: error.message })
  }
}

// =================================GET PRODUCT=================================================

// GET /products
// Returns all products in the collection that aren't deleted.
// Filters
// Size (The key for this filter will be 'size')
// Product name (The key for this filter will be 'name'). You should return all the products with name containing the substring recieved in this filter
// Price : greater than or less than a specific value. The keys are 'priceGreaterThan' and 'priceLessThan'.
// NOTE: For price filter request could contain both or any one of the keys. For example the query in the request could look like { priceGreaterThan: 500, priceLessThan: 2000 } or just { priceLessThan: 1000 } )

// Sort
// Sorted by product price in ascending or descending. The key value pair will look like {priceSort : 1} or {priceSort : -1} eg /products?size=XL&name=Nit%20grit
// Response format
// On success - Return HTTP status 200. Also return the product documents. The response should be a JSON object like this
// On error - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like this

exports.getproduct = async (req, res) => {
  try {

    let data = req.query
    let { size, name, priceLessThan, priceGreaterThan, priceSort } = data
    try {
      await getProductByQuery.validateAsync(data)
    } catch (error) {
      return res.status(400).send({ status: false, message: error.message })
    }
    
    let filter = { isDeleted: false }
    if (name) {
      filter.title = name
    }
    if (size) {
      size = size.toUpperCase().split(",")
      filter.availableSizes = { $in: size }
    }
    if (priceGreaterThan) {
      filter.price = { $gt: priceGreaterThan }
    }
    if (priceLessThan) {
      filter.price = { $lt: priceLessThan }
    }
    if (priceLessThan && priceGreaterThan) {
      filter.price = { $lt: priceLessThan, $gt: priceGreaterThan }
    }

    if (priceSort) {
      if (!priceSort == "1" || !priceSort == "-1") return res.status(400).send({ status: false, message: "price can be sorted by either 1 or -1" })
      if (priceSort == "1") {
        const allProducts = await productModel.find(filter).sort({ price: 1 })
        if (!allProducts) return res.status(404).send({ status: false, message: "no data with this" })
        return res.status(200).send({ status: true, message: "Success", data: allProducts })
      }
      if (priceSort == "-1") {
        const allProducts = await productModel.find(filter).sort({ price: -1 })
        if (!allProducts) return res.status(404).send({ status: false, message: "no data with this filter" })
        return res.status(200).send({ status: true, message: "Success", data: allProducts })
      }
      // }else{
      //   return res.status(400).send({message:"only 1,-1"})
    }

    let getData = await productModel.find(filter).select({ _id: 0, __v: 0 }).sort({ price: 1 })
    if (!getData) return res.status(404).send({ status: false, message: "no product found" })
    return res.status(200).send({ status: true, message: "Success", data: getData })

  } catch (error) {
    return res.status(500).send({ status: false, error: error.message })
  }
}

// ======================================GET PRODUCT BY ID============================================

// GET /products/:productId
// Returns product details by product id
// Response format
// On success - Return HTTP status 200. Also return the product documents. The response should be a JSON object like this
// On error - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like this

exports.getByIdProduct = async (req, res) => {
  try {
    let productId = req.params.productId
    // if (!productId) return res.status(400).send({ status: false, message: "please provide productId in params" })
    if (!mongoose.Types.ObjectId.isValid(productId)) return res.status(400).send({ status: false, message: "Invalid productId" })
    let getproduct = await productModel.findById(productId)
    if (!getproduct) return res.status(400).send({ status: false, message: "This productId does not exist" })
    return res.status(200).send({ status: true, message: "Success", data: getproduct })

  } catch (error) {
    return res.status(500).send({ status: false, error: error.message })
  }
}

// =================================UPDATE PRODUCT=================================================

// PUT /products/:productId
// Updates a product by changing at least one or all fields
// Check if the productId exists (must have isDeleted false and is present in collection). If it doesn't, return an HTTP status 404 with a response body like this
// Response format
// On success - Return HTTP status 200. Also return the updated product document. The response should be a JSON object like this
// On error - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like this

exports.updateProduct = async (req, res) => {
  try {

    let productId = req.params.productId
    let files = req.files
    let data = req.body
    if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "No data found to update :(" })
    if (!mongoose.Types.ObjectId.isValid(productId)) return res.status(400).send({ status: false, message: "This productId is not valid" })

    let fileUrl;
    if (files && files.length > 0) {
      const uploadedFileURL = await uploadFile(files[0])
      fileUrl = uploadedFileURL;
    } data.productImage = fileUrl

    try {
      await updateProJoi.validateAsync(data)
    } catch (error) {
      return res.status(400).send({ status: false, message: error.message })
    }

    // console.log(existInDb)
    let checkProductId = await productModel.findOne({ _id: productId, isDeleted: false })
    if (!checkProductId) return res.status(404).send({ status: false, message: "ProductId does not exist" })

    let titleExist = await productModel.findOne({ title: req.body.title })
    if (titleExist) return res.status(400).send({ status: false, message: "This title is already in use" })

    let { availableSizes } = data
    if (availableSizes) {
      let size = availableSizes.toUpperCase().split(",")
      console.log(size)
      size = [...new Set(size)]
      let enumValue = ["S", "XS", "M", "X", "L", "XXL", "XL"]
      let actualSize = []
      for (let i of size) {
        if (enumValue.includes(i)) {
          actualSize.push(i)
        }
      }
      data.availableSizes = actualSize
    }
    //deleatedAt:
    if (data.isDeleted) {
      if (Object.values(data).includes("true")) {
        data.deletedAt = Date.now()
      } else {
        data.deletedAt = null
      }
    } else {
      data.deletedAt = null
    }

    let updateData = await productModel.findByIdAndUpdate(productId, { $set: { ...data } }, { new: true })
    return res.status(200).send({ status: true, message: "successfully updated", data: updateData })

  } catch (error) {
    return res.status(500).send({ status: false, error: error.message })
  }
}

// ==================================DELETE PRODUCT================================================

// DELETE /products/:productId
// Deletes a product by product id if it's not already deleted
// Response format
// On success - Return HTTP status 200. The response should be a JSON object like this
// On error - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like 

exports.deleteProduct = async (req, res) => {
  try {

    let productId = req.params.productId
    if (!mongoose.Types.ObjectId.isValid(productId)) return res.status(400).send({ status: false, message: "Invalid productId" })
    let deletePro = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })
    if (!deletePro) return res.status(404).send({ status: false, message: "Product not found" })
    return res.status(200).send({ status: true, message: "data successfully deleted", data: deletePro })

  } catch (error) {
    return res.status(500).send({ status: false, error: error.message })
  }
}


// ==================================================================================