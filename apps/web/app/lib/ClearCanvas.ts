 import { Rectangle } from "./Rectangle";
 import { DrawLine } from "./DrawLine";
  import type { ElementsType } from "@repo/common";
import { drawCircle } from "./DrawCricle";
 export  const ClearCanvas = (canvasRef : any , elements :ElementsType[]) => {
     const ctx = canvasRef.current?.getContext("2d");
    if (ctx == null || canvasRef.current == null) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    for (const element of elements) {
      if (element.type === "Rectangle") {
        Rectangle(ctx, element.Startx, element.Starty, element.endX, element.endY, true, element.color , element.strokColor , element.strokWidth);
      } else if (element.type === "Line") {
        DrawLine(ctx, element.Startx, element.Starty, element.endX, element.endY, true, element.color,element.strokWidth);
      }
      else if (element.type == "pencil") {
        const points = element.points;
        for (let i = 1; i < points.length; i++) {
          const prves = points[i - 1];
          const curr = points[i];
          if (!prves || !curr) continue;
          DrawLine(ctx, prves.x, prves.y, curr.x, curr.y, true, element.color , element.strokWidth)
        }
      }
      else if(element.type === 'Ellipse'){
        drawCircle(ctx , element.centerX , element.centerY , element.radius ,element.color , element.strokColor , element.strokWidth) ; 
      }
    }
  }