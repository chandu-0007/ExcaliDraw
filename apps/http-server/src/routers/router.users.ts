import express from "express"
import type { Request, Response } from "express" 
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import {UserSignin} from "@repo/common"
import prisma from "@repo/db/client"
dotenv.config() 

const router : express.Router = express.Router() 
const jwtSecret = process.env.JWT_SECRET 
router.post("/signin" , async (req  : Request, res : Response ) =>{
    const data = req.body ; 
    const dataparse = UserSignin.safeParse(data) ; 
    if(!dataparse.success){
      res.status(400).json({
         message : dataparse.error.message,
      })
      return ; 
    }
    const {username , password} = dataparse.data ; 
   try{
      const user = await prisma.user.create({data:{
         username , 
         password 
      }})
      if(!jwtSecret) return res.status(500).json({message : "Internal server error"})
      const token = jwt.sign({ username }, jwtSecret)
      res.cookie("token", token, { httpOnly: true })  
      res.status(200).json({message : "User signed in successfully"})
   }catch(err){
    res.status(500).json({
        message : "Internal server error"
    })
   }
})

export default router  ; 