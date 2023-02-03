const express=require("express")
const mongoose=require("mongoose")
const multer=require("multer")
const {AppConfig}=require('aws-sdk')
const route=require("./routes/route")
const app=express()
mongoose.set('strictQuery', true)

app.use(express.json())
app.use(multer().any())

mongoose.connect("mongodb+srv://Sakshi:monday123@cluster0.z5dpz2x.mongodb.net/group8Database",
{useNewUrlParser:true})
.then(()=>console.log("mongoDb is connected"))
.catch((err)=>console.log(err))

app.use("/",route)

app.listen(3000,function(){
    console.log("server is running on port:",3000)
})

