import express from "express"
import type { Request, Response } from "express" 
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import {UserSignin} from "@repo/common"
import {prisma} from "@repo/db/client"
import bcrypt from "bcrypt"
import auth from "../middleware/auth"
dotenv.config() 
const router : express.Router = express.Router() 
const jwtSecret = process.env.JWT_SECRET 

//signup router 
router.post("/signup" , async (req  : Request, res : Response ) =>{
    const data = req.body ; 
    const dataparse = UserSignin.safeParse(data) ; 
    if(!dataparse.success){
      res.status(400).json({
         message : "Invalid Input",
      })
      return ; 
    }
    const {username , password} = dataparse.data ; 
    const finduser = await prisma.user.findUnique({where :{username}})
      if(finduser) return  res.status(401).json({
         message : "user already exist"
      })
   try{
      const hashpassword = await bcrypt.hash(password,10) ; 

      const user = await prisma.user.create({data:{
         username , 
         password : hashpassword,  
         updatedAt : new Date() 
      }})
      if(!jwtSecret) return res.status(500).json({message : "Internal server error"})
      const token = jwt.sign({  id : user.id }, jwtSecret)
      res.status(200).json({
         message : "User signed in successfully" , 
         username : user.username  , 
         id : user.id  , 
         token : token  
      })
   }catch(err){
    res.status(500).json({
        message : "Internal server error"
    })
   }
})

//signin router 

router.post("/signin" , async(req : Request , res : Response) =>{
   const data = req.body ; 
    const dataparse = UserSignin.safeParse(data) ; 
    if(!dataparse.success){
      res.status(400).json({
         message : "Invalid Input",
      })
      return ; 
    }
    const {username , password} :{username : string , password : string }= dataparse.data ; 
    try{
      const finduser = await prisma.user.findUnique({where :{username}})
      if(!finduser) return  res.status(404).json({
         message : "user not found "
      })
      const passwordcheck= await bcrypt.compare(password,finduser.password) ; 
      if(passwordcheck){
             if(!jwtSecret)  return res.status(500).json({message : "Internal server is error "})
             const token = jwt.sign({id : finduser.id }  ,jwtSecret)
             res.status(200).json({
             message : "User signed in successfully" , 
             username : finduser.username  , 
             id : finduser.id , 
             token : token  
      })
      }else{
          res.status(401).json({
            message: "Invaild Password "
          })
          return ; 
      }
    }catch(err){
      res.status(500).json({
         message : "Internal server error" 
      })
    }
})

// attachted the middleware router to the below routers 
router.use(auth)

//create room 
router.post("/create-room/:roomname",async( req : Request , res : Response ) =>{
   const  RoomName :  string | undefined   = Array.isArray(req.params.roomname) ? req.params.roomname[0] : req.params.roomname ; 
   console.log(RoomName); 
   if(!RoomName) return res.status(401).json({message :"Invalid room name "})
  const user = req.user as { id: string };
   try{
      const create_room = await prisma.room.create({
         data : {
            name : RoomName , 
            adminId :user.id, 
            updatedAt : new Date() 
         }
      })

      return res.status(200).json({
         message : "Room Created Succesfuuly" , 
         id : create_room.id 
      })
   }catch(err : any ){
         return res.status(500).json({
            message : err.message
         })
   }
})



export default router  ; 