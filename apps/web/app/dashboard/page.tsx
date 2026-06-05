"use client";
import { useRef, useState, useEffect, MouseEvent } from "react"
import { Rectangle } from "../lib/Rectangle"
import { DrawLine } from "../lib/DrawLine";
import { generateUUID } from "../lib/generateUUID"
import EarseElement from "../lib/EaserEelement";
import axios from "axios";
import { useRouter } from 'next/navigation'
import { ToolButton, Divider } from "../components/toollButton";
import type {
  ElementsType
} from "@repo/common";
import { ClearCanvas } from "../lib/ClearCanvas";
import { CheckInLine } from "../lib/CheckInLine";
import { CheckInRect } from "../lib/CheckInRect";
import { findDistance } from "../lib/findDistance";
import { drawCircle } from "../lib/DrawCricle";
import { CheckInCircle } from "../lib/CheckInCricle";
import DrawArrow from "../lib/DrawArrow";
import { handleSelect } from "../lib/HandleSelect";


export default function DashBoard() {
  const [isDrawing, SetisDrawing] = useState<boolean>(false);
  const [elements, SetElements] = useState<ElementsType[]>([]);
  const [SelectElement, setSelectedElement] = useState<ElementsType | null>(null);
  const strokWidth = useRef<number>(3);
  const strokColor = useRef<string>("");
  const earserRef = useRef<boolean>(false);

  //for routing 
  const router = useRouter();

  //staring point
  const pointsRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 })
  const [Color, SetColor] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx != null && canvasRef.current != null) {
      ClearCanvas(canvasRef, elements);
    }
  }, [elements])

  useEffect(() => {
    if (!canvasRef.current) return;

    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;

    const ctx = canvasRef.current.getContext("2d");

    if (ctx) {
      ClearCanvas(canvasRef, elements);
    }
  }, []);


  const SetPencils = useRef<{ x: number, y: number }[]>([]);

  const dragRef = useRef({ x: 0, y: 0 });

  const [DrawingObject, SetDrawingObject] = useState<string>("Rectangle");

  //move object logic 
 const MoveObject = (mouseX: number, mouseY: number) => {
  if (!SelectElement) return;

  const dx = mouseX - dragRef.current.x;
  const dy = mouseY - dragRef.current.y;

  dragRef.current = {
    x: mouseX,
    y: mouseY,
  };

  SetElements(prevs =>
    prevs.map(element => {
      if (element.id !== SelectElement.id) return element;

      switch (element.type) {
        case "Rectangle":
        case "Line":
        case "Arrow":
          return {
            ...element,
            Startx: element.Startx + dx,
            Starty: element.Starty + dy,
            endX: element.endX + dx,
            endY: element.endY + dy,
          };

        case "Ellipse":
          return {
            ...element,
            centerX: element.centerX + dx,
            centerY: element.centerY + dy,
          };
        
        default:
          return element;
      }
    })
  );
};

  const getMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const react = canvasRef.current?.getBoundingClientRect();
    if (!react) return;
    if (DrawingObject === "earser") {
      earserRef.current = true;
      return ; 
    }
    if (DrawingObject === "select") {
      const mouseX = e.clientX - react.left;
      const mouseY = e.clientY - react.top;
       const found = handleSelect(elements ,mouseX, mouseY);
       if(found != null) setSelectedElement(found);
       console.log(found);
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
      SetPencils.current = [{
        x: e.clientX - react.left,
        y: e.clientY - react.top
      }]
    }
    SetisDrawing(true);
  }

  const getMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const react = canvasRef.current?.getBoundingClientRect();
    if (!react) return;
    const newX = e.clientX - react.left;
    const newY = e.clientY - react.top;
    const ctx = canvasRef.current?.getContext("2d");
    if (DrawingObject === "earser" && earserRef.current == true) {
      const found = handleSelect(elements , newX, newY);
      if (found != null) {
        SetElements(EarseElement(elements, found.id));
      }
      return;
    }
    if (SelectElement != null) {
      MoveObject(newX, newY);
      return ; 
    }
    if (!isDrawing) return;

    switch (DrawingObject) {
      case "Rectangle":
        ClearCanvas(canvasRef, elements);
        Rectangle(ctx, pointsRef.current.x, pointsRef.current.y, newX, newY, Color, strokColor.current, strokWidth.current);
        break;
      case "Line":
        ClearCanvas(canvasRef, elements);
        DrawLine(ctx, pointsRef.current.x, pointsRef.current.y, newX, newY, Color, strokWidth.current);
        break;
      case "Ellipse":
        ClearCanvas(canvasRef, elements);
        let radius = findDistance(pointsRef.current.x, pointsRef.current.y, newX, newY);
        drawCircle(ctx, pointsRef.current.x, pointsRef.current.y, radius, Color,strokColor.current, strokWidth.current);
        break;
      case "pencil":
        DrawLine(ctx, pointsRef.current.x, pointsRef.current.y, newX, newY, Color, strokWidth.current);
        pointsRef.current = {
          x: newX,
          y: newY
        }
        SetPencils.current.push({
          x: newX,
          y: newY
        })
        break;
      case "Arrow":
        ClearCanvas(canvasRef, elements);
        DrawArrow(ctx, pointsRef.current.x, pointsRef.current.y, newX, newY, Color, strokWidth.current);
        break;
      default:
        console.log(DrawingObject);
        break;
    }

  }

  const getMouseUp = (e: MouseEvent<HTMLCanvasElement>) => {
    if (SelectElement != null) {
      setSelectedElement(null);
      earserRef.current = false;
      return;
    }
    SetisDrawing(false);
    if (canvasRef == null || canvasRef.current == null) return;
    let newX = e.clientX - canvasRef.current?.getBoundingClientRect().left;
    let newY = e.clientY - canvasRef.current?.getBoundingClientRect().top;
    switch (DrawingObject) {
      case "Rectangle":
        SetElements(prevs => [
          ...prevs,
          {
            id: generateUUID(),
            type: DrawingObject,
            Startx: pointsRef.current.x,
            Starty: pointsRef.current.y,
            endX: newX,
            endY: newY,
            color: Color,
            strokWidth: strokWidth.current,
            strokColor: strokColor.current,
          },
        ]);
        break;

      case "Line":
      case "Arrow":
        SetElements(prevs => [
          ...prevs,
          {
            id: generateUUID(),
            type: DrawingObject,
            Startx: pointsRef.current.x,
            Starty: pointsRef.current.y,
            endX: newX,
            endY: newY,
            color: Color,
            strokWidth: strokWidth.current,
          },
        ]);
        break;

      case "pencil":
        console.log(SetPencils.current);

        SetElements(prevs => [
          ...prevs,
          {
            id: generateUUID(),
            type: "pencil",
            points: SetPencils.current,
            color: Color,
            strokWidth: strokWidth.current,
          },
        ]);

        break;

      case "Ellipse":
        const radius = findDistance(
          pointsRef.current.x,
          pointsRef.current.y,
          newX,
          newY
        );

        SetElements(prevs => [
          ...prevs,
          {
            id: generateUUID(),
            type: "Ellipse",
            centerX: pointsRef.current.x,
            centerY: pointsRef.current.y,
            radius,
            color: Color,
            strokColor: strokColor.current,
            strokWidth: strokWidth.current,
          },
        ]);
        break;
      default:
        break;
    }
  }

  const OnclickSelect = () => {
    SetisDrawing(false);
    SetDrawingObject("select");
  }

  const OnClickShare = async () => {
    try {
      const response = await axios.post("/api/room", {
        elements,
      });
      const data = response.data;
      if (data.Status == 200) {
        console.log(data);
        if (router != null) router.push(`/${data.id}`)
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="w-screen h-screen overflow-hidden relative"
      style={{ background: "#1b1b1f", backgroundImage: "radial-gradient(circle, #2e2e35 1px, transparent 1px)", backgroundSize: "20px 20px" }}>

      {/* Top Bar */}
      <div className="absolute top-3 left-0 right-0 flex items-center justify-between px-4 z-50">

        {/* Brand */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold tracking-tight"
          style={{ background: "#26262c", border: "1px solid #38383f", color: "#e8e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>
          <span className="w-2 h-2 rounded-full" style={{ background: "#7c78e8" }} />
          CollabCanvas
        </div>

        {/* Right — Avatar + Share */}
        <div className="flex items-center gap-2">
          <button
            onClick={OnClickShare}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: "#7c78e8", boxShadow: "0 1px 6px rgba(124,120,232,0.4)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Share
          </button>
        </div>
      </div>

      {/* Left Color Panel */}
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-2 px-2 py-2.5 rounded-xl"
        style={{ background: "#26262c", border: "1px solid #38383f", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>

        {/* Stroke label */}
        <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#555560" }}>Stroke</span>

        {[
          { c: "#e8e8f0", label: "White" },
          { c: "#7c78e8", label: "Purple" },
          { c: "#e85555", label: "Red" },
          { c: "#40c057", label: "Green" },
          { c: "#339af0", label: "Blue" },
          { c: "#e8a020", label: "Orange" },
          { c: "#868e96", label: "Gray" },
        ].map(({ c, label }) => (
          <button
            key={c}
            title={label}
            onClick={()=> strokColor.current = c}
            className="w-6 h-6 rounded-md transition-transform"
            style={{
              background: c,
              border: `2px solid ${strokColor.current === c ? "#e8e8f0" : "transparent"}`,
              transform: Color === c ? "scale(1.1)" : "scale(1)",
            }}
          />
        ))}

        <div className="w-7 h-px" style={{ background: "#38383f" }} />
        <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#555560" }}>Fill</span>

        {[
          { c: "#2a2a32", label: "None", dashed: true },
          { c: "#3d2c00", label: "Dark Orange" },
          { c: "#1a3a22", label: "Dark Green" },
          { c: "#2a2050", label: "Dark Purple" },
          {c : "black" , label : "black"}
        ].map(({ c, label, dashed }) => (
          <button
            key={c}
            title={label}
            className="w-6 h-6 rounded-md transition-transform"
            onClick={() =>SetColor(c)}
            style={{
              background: c,
              border: dashed ? "1.5px dashed #555" : `2px solid transparent`,
            }}
          />
        ))}

        <div className="w-7 h-px" style={{ background: "#38383f" }} />
        <span className="text-[9px] font-semibold uppercase tracking-wider text-white">Size</span>

        {[6, 8, 10].map((size, i) => (
          <button
            key={size}
            className="rounded-full transition-transform"
            onClick={() => strokWidth.current = size-3}
            style={{
              width: size, height: size,
              background: i === 0 ? "#7c78e8" : "#888898",
            }}
          />
        ))}
      </div>

      {/* Bottom Toolbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-3 py-2 rounded-2xl"
        style={{ background: "#26262c", border: "1px solid #38383f", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>

        {/* Select */}
        <ToolButton name="select" active={DrawingObject === "select"} onClick={OnclickSelect} label="Select">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 3l14 9-7 1-4 7z" />
          </svg>
        </ToolButton>

        <Divider />

        {/* Rectangle */}
        <ToolButton name="Rectangle" active={DrawingObject === "Rectangle"} onClick={(e) => SetDrawingObject(e.currentTarget.name)} label="Rect">
          <div className="w-4 h-3 rounded-sm" style={{ border: `2px solid ${DrawingObject === "Rectangle" ? "white" : "#b0b0be"}` }} />
        </ToolButton>

        {/* Ellipse */}
        <ToolButton name="Ellipse" active={DrawingObject === "Ellipse"} onClick={(e) => SetDrawingObject(e.currentTarget.name)} label="Ellipse">
          <div className="w-3.5 h-3.5 rounded-full" style={{ border: `2px solid ${DrawingObject === "Ellipse" ? "white" : "#b0b0be"}` }} />
        </ToolButton>

        {/* Diamond */}
        <ToolButton name="Diamond" active={DrawingObject === "Diamond"} onClick={(e) => SetDrawingObject(e.currentTarget.name)} label="Diamond">
          <div className="w-3 h-3 rotate-45 rounded-[1px]" style={{ border: `2px solid ${DrawingObject === "Diamond" ? "white" : "#b0b0be"}` }} />
        </ToolButton>

        {/* Line */}
        <ToolButton name="Line" active={DrawingObject === "Line"} onClick={(e) => SetDrawingObject(e.currentTarget.name)} label="Line">
          <div className="w-4 h-0.5 -rotate-[30deg]" style={{ background: DrawingObject === "Line" ? "white" : "#b0b0be" }} />
        </ToolButton>

        {/* Arrow */}
        <ToolButton name="Arrow" active={DrawingObject === "Arrow"} onClick={(e) => SetDrawingObject(e.currentTarget.name)} label="Arrow">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="19" x2="19" y2="5" />
            <polyline points="9 5 19 5 19 15" />
          </svg>
        </ToolButton>

        <Divider />

        {/* Pencil */}
        <ToolButton name="pencil" active={DrawingObject === "pencil"} onClick={(e) => SetDrawingObject(e.currentTarget.name)} label="Pencil">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </svg>
        </ToolButton>

        {/* Text */}
        <ToolButton name="text" active={DrawingObject === "text"} onClick={(e) => SetDrawingObject(e.currentTarget.name)} label="Text">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="4 7 4 4 20 4 20 7" />
            <line x1="9" y1="20" x2="15" y2="20" />
            <line x1="12" y1="4" x2="12" y2="20" />
          </svg>
        </ToolButton>

        <Divider />

        {/* Eraser */}
        <ToolButton name="earser" active={DrawingObject === "earser"} onClick={(e) => SetDrawingObject(e.currentTarget.name)} label="Erase">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 20H7L3 16l10-10 7 7-4 4" />
            <path d="M6 10l8 8" />
          </svg>
        </ToolButton>
      </div>

      {/* Bottom Right Zoom */}
      <div className="absolute bottom-[70px] right-3.5 z-50 flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs"
        style={{ background: "#26262c", border: "1px solid #38383f", boxShadow: "0 1px 6px rgba(0,0,0,0.4)", color: "#888898" }}>
        <button className="w-5 h-5 rounded flex items-center justify-center text-sm"
          style={{ background: "#32323a", border: "1px solid #38383f", color: "#b0b0be" }}>−</button>
        <span className="font-semibold min-w-[34px] text-center" style={{ color: "#c0c0cc" }}>100%</span>
        <button className="w-5 h-5 rounded flex items-center justify-center text-sm"
          style={{ background: "#32323a", border: "1px solid #38383f", color: "#b0b0be" }}>+</button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-screen h-screen "
        style={{
          background: "transparent",
          cursor:
            DrawingObject === "select" ? "move" :
              DrawingObject === "earser" ? "cell" : "crosshair",
        }}
        onMouseDown={getMouseDown}
        onMouseMove={getMouseMove}
        onMouseUp={getMouseUp}
      />
    </div>
  );
}