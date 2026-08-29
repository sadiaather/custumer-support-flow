import express from "express"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"

dotenv.config()

 const secret = process.env.secret



export const authentication = (req,res,next)=>{
   
 console.log(req.headers.authorization);
 try{
    const result = req.headers.authorization
      if(! result){
      res.status(500).json({
        success:false,
        message : "plz login or signup"
      })
    }
    const token = result.split(" ")[1]
    console.log(token);

    const user = jwt.verify(token,secret)
      req.user = user
     
next()

 }catch(error){
    console.log(error.message);
    
    return res.status(401).json({
        success:false,
        message : "invalid email or password"
      })
 }


    }
    
export default authentication
