 import {z} from "zod" 

 export const UserSignin =  z.object({
    username : z.string() , 
    password : z.string().min(8) 
 })

export const UserSignup = z.object({
    username : z.string() , 
    password : z.string().min(8) 
})    
