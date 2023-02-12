const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")

// ======================================AUTHENTICATION==========================================

const authentication = async function (req, res, next) {
	try {
		let token = req.headers['authorization']
		if (!token) return res.status(401).send({ message: "token not present" })                                 //bearer sfjdhjhrrjer6464763csdfb
		jwt.verify(token.split(" ")[1], "godKnowsthis", (err, decode) => {
			if (err) {
				return res.status(401).send({ status: false, message: err.message })
			} else {
				req.decode = decode
				next()
			}
		})

	} catch (error) {
		return res.status(500).send({ message: error.message })
	}
}

// ======================================AUTHORIZATION==========================================

const authorization = async (req, res, next) => {
	try {
		let userId = req.params.userId;
		if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).send({ status: false, message: "userId is not valid" });
		if (req.decode.userId != userId) {
			return res.status(403).send({ status: false, message: "You are not authorized" });
		} else {
			return next()
		}
	} catch (err) {
		res.status(500).send({ status: false, error: err.message })
	}
};

// ======================================EXPORTS==========================================

module.exports = { authentication, authorization }