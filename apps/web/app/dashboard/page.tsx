"use client";
import { useRef, useState, useEffect, MouseEvent } from "react"
import { Rectangle } from "../Desgin/Rectangle"
import {Drawing}  from "../Desgin/Drawing"
import { DrawLine } from "../Desgin/DrawLine";
export default function DashBoard() {

  type DrawRectType = { 
    type :  "Rectangle" ,
    Startx : number , 
    Starty  : number , 
    endX : number , 
    endY : number , 
    color : string 
  }
  type DrawLineType = { 
    type :  "Line" ,
    Startx : number , 
    Starty  : number , 
    endX : number , 
    endY : number , 
    color : string 
  }

  type DrawPencilType = { 
     type : "Pencil"  
     points : {
      x :number , 
      y :number 
     }[] , 
     color  : string 
  }
  type ElementsType = 
    DrawRectType | DrawLineType | DrawPencilType
  
  const [isDrawing, SetisDrawing] = useState<boolean>(false);
  const [elements, SetElements] = useState<ElementsType[]>([]);
  const colors = ["black", "red", "blue", "yellow", "green"] as const;
  //staring point
  const [points, SetPoints] = useState<{ x: number, y: number }>({
    x: 0,
    y: 0
  })
  const [Color, SetColor] = useState<string>("black");
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx != null && canvasRef.current != null) {
    ClearCanvas(ctx); 
    }
  }, [])
  
  const ClearCanvas = (ctx: CanvasRenderingContext2D | null | undefined) => {
    if (ctx == null || canvasRef.current == null) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    for (const element of elements) {
      if (element.type === "Rectangle") {
        Rectangle(ctx, element.Startx , element.Starty, element.endX, element.endY, true, element.color);
      }else if (element.type === "Line") {
           DrawLine(ctx, element.Startx, element.Starty, element.endX, element.endY, true, element.color);
      }
      else if(element.type == "Pencil")
       for(const point of element.points){
           Drawing(ctx, point.x , point.y , point.x , point.y , true , element.color);   
      }
    }
  }
  const getMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const react = canvasRef.current?.getBoundingClientRect();
    if (!react) return;
    SetPoints({
      x: e.clientX - react.left,
      y: e.clientY - react.top
    })
    SetisDrawing(true);
  }
  const [DrawingObject , SetDrawingObject] = useState<string>("Rectangle") ; 

  const getMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const react = canvasRef.current?.getBoundingClientRect();
    if (!react) return;
    const ctx = canvasRef.current?.getContext("2d");
    const newX = e.clientX - react.left;
    const newY = e.clientY - react.top;
    if(DrawingObject === "Rectangle" || DrawingObject === "Line") {
      ClearCanvas(ctx) ; 
      if(DrawingObject === "Rectangle") Rectangle(ctx , points.x , points.y , newX  , newY , isDrawing , Color)  ; 
      else DrawLine(ctx , points.x , points.y , newX  , newY , isDrawing , Color) ; 
    }
    else if(DrawingObject === "pencil"){
      Drawing(ctx,points.x , points.y , newX , newY , isDrawing , Color) ; 
      SetPoints({
        x : newX , 
        y : newY 
      })
    }
  }
   

  const getMouseUp = (e : MouseEvent<HTMLCanvasElement>) => {
     SetisDrawing(false) ; 
     if(canvasRef == null || canvasRef.current == null  ) return ; 
     let newX = e.clientX  - canvasRef.current?.getBoundingClientRect().left ; 
     let newY = e.clientY -  canvasRef.current?.getBoundingClientRect().top  ;
     if(DrawingObject === "Rectangle" ||  DrawingObject === "Line"){
     SetElements ( prevs => [
        ...prevs , {
          type : DrawingObject, 
          Startx : points.x  , 
          Starty : points.y , 
          endX : newX , 
          endY : newY , 
          color : Color  
        }
      ]
     )
    }
  }
  const colorClasses : Record<(typeof colors)[number], string> = {
    red: "bg-red-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    black: "bg-cyan-500",
  }

  return (
    <>
      <div className="text-center text-lg pt-4 ">Drawign Board</div>
      <div className="flex  relative justify-center items-center">
        <div className= "absolute inset-0 bg-white  max-w-20 h-auto  rounded-md text-center  ml-2 p-0.5  flex-col justitfy-center items-center  pag-y-2 ">
          <button className="text-black bg-neutral-600 w-full rounded-md " 
          name = "Rectangle"
           onClick={(e)=>SetDrawingObject(e.currentTarget.name)}>Rectangle</button>
          <button className="text-black bg-neutral-600 mt-4  w-full rounded-md " 
          name = "pencil"
         onClick={(e)=>SetDrawingObject(e.currentTarget.name)}>pencil</button>
          <button className="text-black bg-neutral-600 mt-4  w-full rounded-md " 
          name = "Line"
         onClick={(e)=>SetDrawingObject(e.currentTarget.name)}>Line</button>
        </div>
        <div className="absolute mt-40 left-0 top-0 w-24 h-1/2 bg-neutral-100 text-black rounded-md flex flex-col gap-2 p-2">
          <p className="text-sm font-medium">Choose color</p>
          {colors.map((color, index) => {
            return (
              <button
                key={index}
                name={color}
                onClick={(e) => SetColor(e.currentTarget.name)}
                className={`${colorClasses[color]} w-full h-8 rounded-md`}
              ></button>
            );
          })}
        </div>
        <canvas
          ref={canvasRef}
          width={1000}
          height={600}
          onMouseDown={getMouseDown}
          onMouseMove={getMouseMove}
          onMouseUp={getMouseUp}
        ></canvas>
      </div>
    </>
  )
}