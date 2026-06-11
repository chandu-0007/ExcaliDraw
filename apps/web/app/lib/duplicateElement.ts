import { ElementsType } from "@repo/common"
import { generateUUID } from "./generateUUID"

const duplicateElement = (Element : ElementsType) =>{
    console.log("duplicating element ")
    let duplicateElement = null ;
    switch(Element.type){
        case "Rectangle": 
        case "Arrow" : 
        case "Line" : 
           duplicateElement =  {
                ...Element , 
               id : generateUUID() , 
               Startx : Element.Startx + 20 , 
               Starty : Element.Starty + 20 , 
               endX : Element.endX+ 20 , 
               endY : Element.endY + 20 
           }
        break  ;
         case "Ellipse": 
             duplicateElement =  {
                ...Element , 
               id : generateUUID() , 
               centerX : Element.centerX + 20 , 
               centerY : Element.centerY + 20 ,   
           }
        break ;
         case "text" : 
            duplicateElement = {
                 ...Element , 
                 id : generateUUID() , 
                 x : Element.x + 20 , 
                 y : Element.y+20 
            }
            break  ; 
         default :
           return null ; 
    }

    return duplicateElement ; 
     
}

export default duplicateElement ; 