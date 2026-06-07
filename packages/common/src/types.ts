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
    color: string , 
    strokWidth : number , 
    strokColor : string 
  }
 export  type DrawLineType = {
    id: string,
    type: "Line" | "Arrow",
    Startx: number,
    Starty: number,
    endX: number,
    endY: number,
    color: string , 
    strokWidth:number
  }

  export type TextType =  {
    id: string;
    type: "text";
    x: number;
    y: number;
    text: string;
    color: string;
    fontSize: number;
  }

 export type DrawPencilType = {
    id: string,
    type: "pencil"
    points: {
      x: number,
      y: number
    }[],
    color: string , 
    strokWidth : number , 
  }

  export type DrawCircle =  {
   id : string , 
   type: "Ellipse", 
   centerX: number , 
   centerY: number , 
   radius : number , 
   color : string  , 
   strokWidth : number , 
   strokColor : string 
  }
 export type ElementsType =
    DrawRectType | DrawLineType | DrawPencilType | DrawCircle | TextType 
