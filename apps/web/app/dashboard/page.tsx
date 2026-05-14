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
  }, [elements])
  const [pencil , SetPencil ] = useState<{ x: number , y : number}[]>([])
  const ClearCanvas = (ctx: CanvasRenderingContext2D | null | undefined) => {
    if (ctx == null || canvasRef.current == null) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    for (const element of elements) {
      if (element.type === "Rectangle") {
        Rectangle(ctx, element.Startx , element.Starty, element.endX, element.endY, true, element.color);
      }else if (element.type === "Line") {
           DrawLine(ctx, element.Startx, element.Starty, element.endX, element.endY, true, element.color);
      }
      else if(element.type == "Pencil"){
            const points = element.points ; 
            for(let i = 1  ;i < points.length ; i++){
              const prves = points[i-1] ; 
              const curr = points[i] ; 
              if(!prves || !curr) continue; 
              Drawing(ctx , prves.x , prves.y,curr.x,curr.y,true , element.color)
            }
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
    if(DrawingObject === "Pencil") {
      SetPencil([{
        x : points.x , 
        y : points. y 
      }])
    }
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
      SetPencil(prevs =>  [...prevs , { x : newX , y : newY }])
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
    }else 
    {
      SetElements( prevs => [ ...prevs , {
        type  : "Pencil" , 
        points : pencil, 
        color : Color 
      }])

      SetPencil([]);
    }
    
  }
  const colorClasses : Record<(typeof colors)[number], string> = {
    red: "bg-red-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    black: "bg-black",
  }

  return (
  <div className="w-screen h-screen bg-[#1e1e1e] overflow-hidden flex">

    {/* Top Toolbar */}
    <div className="absolute left-1/2 top-2 -translate-x-1/2  z-50">
      <div className="bg-[#2b2b2b] border border-neutral-700 shadow-2xl rounded-2xl p-3 flex gap-3">

        <button
          name="Rectangle"
          onClick={(e) => SetDrawingObject(e.currentTarget.name)}
          className={`
            px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
            ${
              DrawingObject === "Rectangle"
                ? "bg-white text-black"
                : "bg-[#3a3a3a] text-white hover:bg-[#4a4a4a]"
            }
          `}
        >
          Rectangle
        </button>

        <button
          name="Line"
          onClick={(e) => SetDrawingObject(e.currentTarget.name)}
          className={`
            px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
            ${
              DrawingObject === "Line"
                ? "bg-white text-black"
                : "bg-[#3a3a3a] text-white hover:bg-[#4a4a4a]"
            }
          `}
        >
          Line
        </button>

        <button
          name="pencil"
          onClick={(e) => SetDrawingObject(e.currentTarget.name)}
          className={`
            px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
            ${
              DrawingObject === "pencil"
                ? "bg-white text-black"
                : "bg-[#3a3a3a] text-white hover:bg-[#4a4a4a]"
            }
          `}
        >
          Pencil
        </button>
      </div>
    </div>

    {/* Top Color Palette */}
    <div className="absolute top-1/3 left-20 w-20  -translate-x-1/2 z-50">
      <div className="bg-[#2b2b2b] border border-neutral-700 shadow-2xl rounded-2xl px-4 py-3 flex-col items-center gap-3">
        {colors.map((color) => (
          <div 
          key={color}
          > <button
            name={color}
            onClick={(e) => SetColor(e.currentTarget.name)}
            className={`
              w-6 h-6 rounded-xl border-4 transition-all duration-200
              ${colorClasses[color]}
              ${
                Color === color
                  ? "border-white scale-110"
                  : "border-transparent hover:scale-105"
              }
            `}
          />  </div>
        ))}
      </div>
    </div>

    {/* Canvas */}
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      className="w-screen h-screen bg-[#1e1e1e] cursor-crosshair"
      onMouseDown={getMouseDown}
      onMouseMove={getMouseMove}
      onMouseUp={getMouseUp}
    />
  </div>
)
}