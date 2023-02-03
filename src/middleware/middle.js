const jwt=require("jsonwebtoken")
const mongoose=require("mongoose")

const authentication=async function(req,res,next){
  try {
	  let token =req.headers["x-api-key"]
	    if(!token) return res.status(401).send({message:"token not present"})
	jwt.verify(token,"groupIsGood",(err,decode)=>{
	    if(err){
	        return res.status(401).send({message:err.message})
	    }else{
	        req.decode=decode
	        return next()
	    }
    }
)} catch (error) {
	return res.status(500).send({message:error.message})
}}

module.exports={authentication}