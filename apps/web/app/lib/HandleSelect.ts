import type { ElementsType } from "@repo/common";
const handleSelect = ( elements:  ElementsType[], x :  number, y: number) => {
    for (const element of elements) {
      if (
        element.type === "Rectangle") {
        const minX = Math.min(element.Startx, element.endX);
        const maxX = Math.max(element.Startx, element.endX);

        const minY = Math.min(element.Starty, element.endY);
        const maxY = Math.max(element.Starty, element.endY);

        if(x >= minX && x <=maxX &&  y >= minY && y <= maxY){
         return element ; 
        return ; 
        }
        console.log(element?.id);
      }
    }
    return null ; 
  };