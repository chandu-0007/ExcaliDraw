"use client";
import { useRef, useState, useEffect, MouseEvent } from "react"
import { Rectangle } from "../Desgin/Rectangle"
import {Drawing}  from "../Desgin/Drawing"
import { DrawLine } from "../Desgin/DrawLine";
export default function DashBoard() {
  const [isDrawing, SetisDrawing] = useState<boolean>(false);
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
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }, [])


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
  const Draw = (ctx: CanvasRenderingContext2D | null | undefined, x2: number, y2: number) => {
    if (!ctx || !isDrawing || canvasRef.current == null) return;
    ctx.clearRect(0, 0, canvasRef.current?.width, canvasRef.current.height);
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    if(DrawingObject === "Rectangle")Rectangle(ctx, points.x, points.y, x2, y2, isDrawing,Color);
    else DrawLine(ctx, points.x, points.y, x2, y2, isDrawing, Color) ;
  }
  const getMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const react = canvasRef.current?.getBoundingClientRect();
    if (!react) return;
    const ctx = canvasRef.current?.getContext("2d");
    const newX = e.clientX - react.left;
    const newY = e.clientY - react.top;
    if(DrawingObject === "Rectangle") Draw(ctx, newX, newY);
    else if(DrawingObject === "pencil"){
      Drawing(ctx,points.x , points.y , newX , newY , isDrawing , Color) ; 
      SetPoints({
        x : newX , 
        y : newY 
      })
    }else{
      Draw(ctx,newX ,newY);
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
          onMouseUp={() => SetisDrawing(false)}
        ></canvas>
      </div>
    </>
  )
}