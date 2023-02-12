const aws = require("aws-sdk")

aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile = async (file) => {
    try {
        return new Promise(function (resolve, reject) {
            let s3 = new aws.S3({ apiVersion: "2006-03-01" })
            var uploadParams = {
                ACL: "public-read",
                Bucket: "classroom-training-bucket",
                Key: "ecart/" + file.originalname,
                Body: file.buffer
            }
            s3.upload(uploadParams, function (err, data) {
                if (err) {
                    console.log("can't upload file")
                    return reject({ "error": err })
                }
                return resolve(data.Location)
            })
        })
    }

    catch (error) {
        console.log(error)
        res.status(500).send({ status: false, message: error.message })
    }
}
module.exports.uploadFile = uploadFile
//access control list