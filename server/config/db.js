import mongoose from "mongoose";
import dotenv from "dotenv";
import chalk from "chalk";

dotenv.config()
const dbConection = process.env.MONGODB_URL


const connectDB = async()=>{
   console.log(dbConection)
   try {
    await mongoose.connect(dbConection,{
      dbname : "final-hackathon"
    })
    
      console.log(chalk.blue.bgRed.bold('MongoDB connected successfully'));
   }
   catch(error){
     console.error('MongoDB connection failed:', error);
       process.exit(1)
    }
    
   }


export default connectDB

