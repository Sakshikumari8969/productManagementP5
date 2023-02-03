const express=require("express")
const router=express.Router()
const userController=require("../controller/userController")
// const {authentication}=require("../middleware/middle")

router.post("/register",userController.createUser)
router.post("/login",userController.loginUser)
router.get("/user/:userId/profile",userController.getUser)
router.put("/user/:userId/profile",userController.updateUser)


router.all("/*",(req,res)=>{
    res.status(400).send({message:"Invalid path"})
})

module.exports=router;
