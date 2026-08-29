import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import User from "../model/UserModel.js"

dotenv.config()

const secret = process.env.secret



export const signup = async (req,res)=>{
 
    const {name,email,password}=  req.body
   console.log(req.body);

try{
    if(!name || !email || !password){
        res.status(400).json({
            success : false,
            message : "data not found"
        })
        return
    }

     const  hashedPassword = await bcrypt.hash(password,10)   

     const result = await User.create({
        name,email,password:hashedPassword,
     })
 
     const token = jwt.sign({
        userId : result._id},secret)

        
        
       return res.status(200).json({
            success : true,
            message : "user created successfuly",
            token,
            data : result
        })
}catch(error){
    console.log(error.message);
     return res.status(500).json({
      success: false,
      message: error.message,
    });
}
}

export const login = async (req,res)=>{
    const {email , password}= req.body
    

   try{
     const result = await User.findOne({email})
console.log(result);

       if(!result){
      return  res.status(502).json({
        success : false,
        message : " user not found"
        })
    
    }
    const isMatch = await bcrypt.compare(password,result.password)
    if(!isMatch){
     return   res.status(401).json({
            success : false,
            message: "invalid password"
        })
    }

    if (result.isBlocked) {
  return res.status(403).json({
    message: "Your account has been blocked by admin",
  });
}

    const token = jwt.sign({userId:result._id},secret)
    return res.status(200).json({
        success : true,
        message : "user login successfuly ",
        token,
    })
   }catch(error){
    console.log(error .message);
     return res.status(500).json({
            success: false,
            message: error.message
        })
   }
}