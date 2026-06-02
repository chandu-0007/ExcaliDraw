 import {z} from "zod" 

 export const UserSignin =  z.object({
    username : z.string() , 
    password : z.string().min(8) 
 })

export const UserSignup = z.object({
    username : z.string() , 
    password : z.string().min(8) 
})    

 export  type DrawRectType = {
    id: string,
    type: "Rectangle",
    Startx: number,
    Starty: number,
    endX: number,
    endY: number,
    color: string
  }
 export  type DrawLineType = {
    id: string,
    type: "Line",
    Startx: number,
    Starty: number,
    endX: number,
    endY: number,
    color: string
  }
 export type DrawPencilType = {
    id: string,
    type: "pencil"
    points: {
      x: number,
      y: number
    }[],
    color: string
  }

  export type DrawCircle =  {
   id : string , 
   type: "Ellipse", 
   centerX: number , 
   centerY: number , 
   radius : number , 
   color : string 
  }
 export type ElementsType =
    DrawRectType | DrawLineType | DrawPencilType | DrawCircle 
