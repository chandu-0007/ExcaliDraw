"use client"; 
import {useRef  , useState , useEffect, MouseEvent } from "react"
export default function DashBoard() {
  const [isDrawing ,SetisDrawing] = useState<boolean>(false); 
  //staring point
  const [points , SetPoints] = useState<{x : number , y : number }>({
    x : 0 , 
    y : 0 
  })
  const canvasRef = useRef<HTMLCanvasElement>(null) 
   useEffect(()=>{
     const ctx = canvasRef.current?.getContext("2d"); 
     if(ctx!=null  && canvasRef.current != null)  { 
       ctx.clearRect(0,0,canvasRef.current.width , canvasRef.current.height) 
       ctx.fillStyle = "white"
       ctx.fillRect(0,0,canvasRef.current.width , canvasRef.current.height) 
     }
   } , [])


 const getMouseDown = (e : MouseEvent<HTMLCanvasElement>)=>{
         const react  = canvasRef.current?.getBoundingClientRect(); 
         if(!react) return ; 
         SetPoints({
            x :e.clientX - react.left , 
            y : e.clientY - react.top 
         })
         SetisDrawing(true) ;
 }

 const DrewLine = ( ctx : CanvasRenderingContext2D | null | undefined,x2 : number , y2 :number )=>{ 
  if(!ctx || !isDrawing || canvasRef.current == null) return ;  
  ctx.clearRect(0, 0,canvasRef.current?.width, canvasRef.current.height); 
  ctx.fillStyle = "white"
  ctx.fillRect(0,0,canvasRef.current.width , canvasRef.current.height) 
  ctx.strokeStyle = "black"; 
  let w = x2-points.x ; 
  let h = y2-points.y ; 
  ctx.strokeRect(points.x , points.y , w , h);  
 }
 const getMouseMove = (e : MouseEvent<HTMLCanvasElement> ) =>{
  if(!isDrawing) return ; 
    const react = canvasRef.current?.getBoundingClientRect() ; 
    if(!react) return ; 
    const ctx = canvasRef.current?.getContext("2d"); 
    const newX = e.clientX - react.left ; 
    const newY = e.clientY - react.top ; 
    DrewLine( ctx , newX , newY ); 
 } 
      return (
        <>
          <div className="text-center text-lg pt-4 ">Drawign Board</div>
          <div>
             <canvas  
              ref = {canvasRef}
              width={1000} 
              height={1000} 
              onMouseDown={getMouseDown}
              onMouseMove={getMouseMove} 
              onMouseUp={()=>SetisDrawing(false)}
             ></canvas>
          </div>
        </>
      )
}