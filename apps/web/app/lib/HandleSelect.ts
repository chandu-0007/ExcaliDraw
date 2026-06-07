import type { ElementsType } from "@repo/common";
import { CheckInRect } from "./CheckInRect";
import { CheckInLine } from "./CheckInLine";
import { CheckInCircle } from "./CheckInCricle";
import { CheckInText } from "./CheckInText";
export const handleSelect = ( elements:  ElementsType[], x :  number, y: number) => {
    for (const element of elements) {
       switch(element.type){
          case "Rectangle" : 
             if(CheckInRect(element , x , y )) return element ; 
             break ; 
          case "Line": 
          case "Arrow":
             if(CheckInLine(element,x,y)) return element ; 
             break ; 
          case "Ellipse" : 
             if(CheckInCircle(element,x,y))return element ; 
             break; 
          case "text" : 
             if(CheckInText(element,x,y)) return element ; 
             break ; 
          default : 
            return null; 
       }
    }
    return null ; 
  };