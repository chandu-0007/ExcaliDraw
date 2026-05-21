"use client";
import { useRef, useState, useEffect, MouseEvent } from "react"
import { Rectangle } from "../lib/Rectangle"
import { Drawing } from "../lib/Drawing"
import { DrawLine } from "../lib/DrawLine";
import { start } from "repl";
import { number } from "framer-motion";
export default function DashBoard() {

  type DrawRectType = {
    id: string,
    type: "Rectangle",
    Startx: number,
    Starty: number,
    endX: number,
    endY: number,
    color: string
  }
  type DrawLineType = {
    id: string,
    type: "Line",
    Startx: number,
    Starty: number,
    endX: number,
    endY: number,
    color: string
  }

  type DrawPencilType = {
    id: string,
    type: "pencil"
    points: {
      x: number,
      y: number
    }[],
    color: string
  }
  type ElementsType =
    DrawRectType | DrawLineType | DrawPencilType
  const [isDrawing, SetisDrawing] = useState<boolean>(false);
  const [elements, SetElements] = useState<ElementsType[]>([]);
  const [SelectElement, setSelectedElement] = useState<DrawRectType | null>(null);
  const colors = ["black", "red", "blue", "yellow", "green"] as const;
  //staring point
  const pointsRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 })
  const [Color, SetColor] = useState<string>("black");
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx != null && canvasRef.current != null) {
      ClearCanvas(ctx);
    }
  }, [elements])

  useEffect(() => {
    if (!canvasRef.current) return;

    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;

    const ctx = canvasRef.current.getContext("2d");

    if (ctx) {
      ClearCanvas(ctx);
    }
  }, []);


  const SetPencils = useRef<{ x: number, y: number }[]>([]);

  const dragRef = useRef({ x: 0, y: 0 });

  const ClearCanvas = (ctx: CanvasRenderingContext2D | null | undefined) => {
    if (ctx == null || canvasRef.current == null) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    for (const element of elements) {
      if (element.type === "Rectangle") {
        Rectangle(ctx, element.Startx, element.Starty, element.endX, element.endY, true, element.color);
      } else if (element.type === "Line") {
        DrawLine(ctx, element.Startx, element.Starty, element.endX, element.endY, true, element.color);
      }
      else if (element.type == "pencil") {
        const points = element.points;
        for (let i = 1; i < points.length; i++) {
          const prves = points[i - 1];
          const curr = points[i];
          if (!prves || !curr) continue;
          Drawing(ctx, prves.x, prves.y, curr.x, curr.y, true, element.color)
        }
      }

    }
  }

  function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16;//random number between 0 and 16
      if (d > 0) {//Use timestamp until depleted
        r = (d + r) % 16 | 0;
        d = Math.floor(d / 16);
      } else {//Use microseconds since page-load if supported
        r = (d2 + r) % 16 | 0;
        d2 = Math.floor(d2 / 16);
      }
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }


  const [DrawingObject, SetDrawingObject] = useState<string>("Rectangle");

  const handleSelect = (x: number, y: number) => {
    for (const element of elements) {
      if (
        element.type === "Rectangle") {
        const minX = Math.min(element.Startx, element.endX);
        const maxX = Math.max(element.Startx, element.endX);

        const minY = Math.min(element.Starty, element.endY);
        const maxY = Math.max(element.Starty, element.endY);

        if(x >= minX && x <=maxX &&  y >= minY && y <= maxY){
        setSelectedElement(element);
        return ; 
        }
        console.log(element?.id);
      }
    }
    setSelectedElement(null);
  };


  //move object logic 
  const MoveObject = (
    mouseX: number,
    mouseY: number
  ) => {
    if (!SelectElement) return;

    const dx = mouseX - dragRef.current.x;
    const dy = mouseY - dragRef.current.y;

    dragRef.current = {
      x: mouseX,
      y: mouseY,
    };

    SetElements((prevs) =>
      prevs.map((element) =>
        element.id === SelectElement.id &&
          element.type === "Rectangle"
          ? {
            ...element,
            Startx: element.Startx + dx,
            Starty: element.Starty + dy,
            endX: element.endX + dx,
            endY: element.endY + dy,
          }
          : element
      )
    );
  };

  const getMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const react = canvasRef.current?.getBoundingClientRect();
    if (!react) return;
    if (DrawingObject === "select") {
      const mouseX = e.clientX - react.left;
      const mouseY = e.clientY - react.top;

      handleSelect(mouseX, mouseY);

      dragRef.current = {
        x: mouseX,
        y: mouseY,
      };
      return;
    }
    pointsRef.current = {
      x: e.clientX - react.left,
      y: e.clientY - react.top
    }
    if (DrawingObject === "pencil") {
      SetPencils.current.push({
        x: e.clientX - react.left,
        y: e.clientY - react.top
      })
    }
    SetisDrawing(true);
  }
  const getMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const react = canvasRef.current?.getBoundingClientRect();
    if (!react) return;
    const newX = e.clientX - react.left;
    const newY = e.clientY - react.top;
    const ctx = canvasRef.current?.getContext("2d");
    if (SelectElement != null) {
      MoveObject(newX, newY);
    }
    if (!isDrawing) return;

    if (DrawingObject === "Rectangle" || DrawingObject === "Line") {
      ClearCanvas(ctx);
      if (DrawingObject === "Rectangle") Rectangle(ctx, pointsRef.current.x, pointsRef.current.y, newX, newY, isDrawing, Color);
      else DrawLine(ctx, pointsRef.current.x, pointsRef.current.y, newX, newY, isDrawing, Color);
    }
    else if (DrawingObject === "pencil") {
      Drawing(ctx, pointsRef.current.x, pointsRef.current.y, newX, newY, isDrawing, Color);
      pointsRef.current = {
        x: newX,
        y: newY
      }
      SetPencils.current.push({
        x: newX,
        y: newY
      })
    }
  }

  const getMouseUp = (e: MouseEvent<HTMLCanvasElement>) => {
    if (SelectElement != null) {
      setSelectedElement(null);
      return;
    }
    SetisDrawing(false);
    if (canvasRef == null || canvasRef.current == null) return;
    let newX = e.clientX - canvasRef.current?.getBoundingClientRect().left;
    let newY = e.clientY - canvasRef.current?.getBoundingClientRect().top;
    if (DrawingObject === "Rectangle" || DrawingObject === "Line") {
      SetElements(prevs => [
        ...prevs, {
          id: generateUUID(),
          type: DrawingObject,
          Startx: pointsRef.current.x,
          Starty: pointsRef.current.y,
          endX: newX,
          endY: newY,
          color: Color
        }
      ]
      )
    } else {
      SetElements(prevs => [...prevs, {
        id: generateUUID(),
        type: "pencil",
        points: SetPencils.current,
        color: Color
      }])

      SetPencils.current = [];
    }

  }
  const colorClasses: Record<(typeof colors)[number], string> = {
    red: "bg-red-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    black: "bg-black",
  }


  const OnclickSelect = (e: MouseEvent<HTMLElement>) => {
    SetisDrawing(false);
    SetDrawingObject("select");
  }
  return (
    <div className="w-screen h-screen bg-[#1e1e1e] overflow-hidden flex">

      {/* Top Toolbar */}
      <div className="absolute left-1/2 top-2 -translate-x-1/2  z-50">
        <div className="bg-[#2b2b2b] border border-neutral-700 shadow-2xl rounded-2xl p-3 flex gap-3">

          <button
            name="select"
            onClick={OnclickSelect}
            className={`
            px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
            ${DrawingObject === "select"
                ? "bg-white text-black"
                : "bg-[#3a3a3a] text-white hover:bg-[#4a4a4a]"
              }
          `}
          >
            Select
          </button>


          <button
            name="Rectangle"
            onClick={(e) => SetDrawingObject(e.currentTarget.name)}
            className={`
            px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
            ${DrawingObject === "Rectangle"
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
            ${DrawingObject === "Line"
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
            ${DrawingObject === "pencil"
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
              ${Color === color
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
        className="w-screen h-screen bg-[#1e1e1e] cursor-crosshair"
        onMouseDown={getMouseDown}
        onMouseMove={getMouseMove}
        onMouseUp={getMouseUp}
      />
    </div>
  )
}