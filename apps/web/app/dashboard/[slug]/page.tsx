"use client";

import React, {
  useRef,
  useState,
  useEffect,
  MouseEvent,
} from "react";
import { ClearCanvas } from "../../lib/ClearCanvas";
import { ToolButton, Divider } from "../../components/toollButton";
import { useParams } from "next/navigation";
import { generateUUID } from "../../lib/generateUUID";
import { Rectangle } from "../../lib/Rectangle";
import { Drawing } from "../../lib/Drawing";
import { DrawLine } from "../../lib/DrawLine";
import { CheckInLine } from "../../lib/CheckInLine";
import { CheckInRect } from "../../lib/CheckInRect";
import EarseElement from "../../lib/EaserEelement";

import { useSocket } from "../../Context-API/UseSocket";
import type { ElementsType } from "@repo/common";
import { read } from "fs";

export default function Collaboration() {
  const params = useParams();

  const [elements, SetElements] = useState<ElementsType[]>([]);
  const isDrawing = useRef<boolean>(false);
  const [DrawingObject, SetDrawingObject] = useState<string>("Rectangle");
  const [Color, SetColor] = useState("black");
  const SelectElement = useRef<ElementsType | null>(null);

  const SetPoints = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const SetPencil = useRef<{ x: number; y: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const earserRef = useRef<boolean>(false);
  const dragRef = useRef({ x: 0, y: 0 });

  const { socket, connect, disconnect } = useSocket();

  useEffect(() => {
    connect();
    if (!canvasRef.current) return;

    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;

    const ctx = canvasRef.current.getContext("2d");

    if (ctx) {
      ClearCanvas(canvasRef, elements);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.emit("join-room", { roomId: params.slug as string });
    return () => { disconnect(); };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const roomHandler = (data: { elements: ElementsType[] }) => {
      console.log(data);
      SetElements(data.elements || []);
    };

    const receiveHandler = (data: { elements: ElementsType[] }) => {
      console.log(data);
      SetElements(data.elements);
    };

    socket.on("room-data", roomHandler);
    socket.on("receive-element", receiveHandler);

    return () => {
      socket.off("room-data", roomHandler);
      socket.off("receive-element", receiveHandler);
    };
  }, [socket]);


  useEffect(() => {
    if (!socket) return;
    const timeout = setTimeout(() => {
      socket.emit("save-elements", { roomId: params.slug, elements });
    }, 2000);
    return () => clearTimeout(timeout);
  }, [elements]);

  useEffect(() => {
    if (!canvasRef.current) return;
    ClearCanvas(canvasRef, elements);
  }, [elements]);



  const handleSelect = (x: number, y: number) => {
    for (const element of elements) {
      if (element.type === "Rectangle") {
        if (CheckInRect(element, x, y)) {
          SelectElement.current = element;
          return;
        }
      } else if (element.type === "Line") {
        if (CheckInLine(element, x, y)) {
          SelectElement.current = element;
          return;
        }
      }
    }
    SelectElement.current = null
  };

  const MoveObject = (mouseX: number, mouseY: number) => {
    if (!SelectElement.current) return;

    const dx = mouseX - dragRef.current.x;
    const dy = mouseY - dragRef.current.y;

    dragRef.current = { x: mouseX, y: mouseY };

    SetElements((prevs) =>
      prevs.map((element) =>
        element.id === SelectElement.current?.id && element.type === "Rectangle"
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

    if (DrawingObject === "earser") {

      earserRef.current = true;
      return;
    }

    if (DrawingObject === "select") {
      const mouseX = e.clientX - react.left;
      const mouseY = e.clientY - react.top;
      handleSelect(mouseX, mouseY);
      dragRef.current = { x: mouseX, y: mouseY };
      return;
    }

    SetPoints.current = { x: e.clientX - react.left, y: e.clientY - react.top };

    if (DrawingObject === "pencil") {
      SetPencil.current = [
        {
          x: e.clientX - react.left,
          y: e.clientY - react.right,
        },
      ];
    }

    isDrawing.current = true;
  };

  const getMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newX = e.clientX - rect.left;
    const newY = e.clientY - rect.top;
    const ctx = canvasRef.current?.getContext("2d");

    // Eraser
    if (DrawingObject === "earser" && earserRef.current == true) {
      handleSelect(newX, newY);
      if (SelectElement.current != null) {
        const updated = EarseElement(
          elements,
          SelectElement.current!.id
        );

        SetElements(updated);

        socket?.emit("share-elements", {
          roomId: params.slug,
          elements: updated,
        });
      }
      return;
    }

    if (DrawingObject === "select" && SelectElement.current != null) {
      MoveObject(newX, newY);
      return;
    }

    if (isDrawing.current == false) return;

    if (DrawingObject === "Rectangle" || DrawingObject === "Line") {
      ClearCanvas(canvasRef, elements);
      if (DrawingObject === "Rectangle") {
        Rectangle(ctx, SetPoints.current.x, SetPoints.current.y, newX, newY, true, Color);
      } else {
        DrawLine(ctx, SetPoints.current.x, SetPoints.current.y, newX, newY, true, Color);
      }
    } else if (DrawingObject === "pencil") {
      Drawing(ctx, SetPoints.current.x, SetPoints.current.y, newX, newY, true, Color);
      SetPencil.current.push({ x: newX, y: newY });
      SetPoints.current = { x: newX, y: newY };
    }
  };

  const getMouseUp = (e: MouseEvent<HTMLCanvasElement>) => {
    if (earserRef.current == true) earserRef.current = false;

    if (DrawingObject === "select" && SelectElement.current != null) {
      SelectElement.current = null;
    }

    isDrawing.current = false;

    if (canvasRef == null || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left;
    const newY = e.clientY - rect.top;
    let newElement : ElementsType | null = null ; 
    if (DrawingObject === "Rectangle" || DrawingObject === "Line") {
      newElement = {
          id: generateUUID(),
          type: DrawingObject,
          Startx: SetPoints.current.x,
          Starty: SetPoints.current.y,
          endX: newX,
          endY: newY,
          color: Color
        }
    } else if (DrawingObject === "pencil") {
      newElement =  {
        id: generateUUID(),
        type: DrawingObject,
        points: SetPencil.current,
        color: Color,
      }
      SetPencil.current = [];
    }
    if(newElement != null){
      SetElements((prev)=> [...prev , newElement!]) ;
      const updatedElements =  [,,,elements , newElement ] ; 
      socket?.emit('share-elements', { roomId: params.slug , updatedElements})
    }
  };

  const OnclickSelect = (e: MouseEvent<HTMLElement>) => {
    isDrawing.current = false;
    SelectElement.current = null;
    SetDrawingObject("select")
  };



  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{
        background: "#1b1b1f",
        backgroundImage: "radial-gradient(circle, #2e2e35 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      {/* Top Bar */}
      <div className="absolute top-3 left-0 right-0 flex items-center justify-between px-4 z-50">
        <div
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold tracking-tight"
          style={{
            background: "#26262c",
            border: "1px solid #38383f",
            color: "#e8e8f0",
            boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
          }}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: "#7c78e8" }} />
          CollabCanvas
        </div>
      </div>

      {/* Left Color Panel */}
      <div
        className="absolute left-3.5 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-2 px-2 py-2.5 rounded-xl"
        style={{
          background: "#26262c",
          border: "1px solid #38383f",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#555560" }}>
          Stroke
        </span>

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
            onClick={() => SetColor(c)}
            className="w-6 h-6 rounded-md transition-transform"
            style={{
              background: c,
              border: `2px solid ${Color === c ? "#e8e8f0" : "transparent"}`,
              transform: Color === c ? "scale(1.1)" : "scale(1)",
            }}
          />
        ))}

        <div className="w-7 h-px" style={{ background: "#38383f" }} />
        <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#555560" }}>
          Fill
        </span>

        {[
          { c: "#2a2a32", label: "None", dashed: true },
          { c: "#3d2c00", label: "Dark Orange" },
          { c: "#1a3a22", label: "Dark Green" },
          { c: "#2a2050", label: "Dark Purple" },
        ].map(({ c, label, dashed }) => (
          <button
            key={c}
            title={label}
            className="w-6 h-6 rounded-md transition-transform"
            style={{
              background: c,
              border: dashed ? "1.5px dashed #555" : "2px solid transparent",
            }}
          />
        ))}

        <div className="w-7 h-px" style={{ background: "#38383f" }} />
        <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#555560" }}>
          Size
        </span>

        {[6, 9, 13].map((size, i) => (
          <button
            key={size}
            className="rounded-full transition-transform"
            style={{
              width: size,
              height: size,
              background: i === 0 ? "#7c78e8" : "#888898",
            }}
          />
        ))}
      </div>

      {/* Bottom Toolbar */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-3 py-2 rounded-2xl"
        style={{
          background: "#26262c",
          border: "1px solid #38383f",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        <ToolButton name="select" active={DrawingObject === "select"} onClick={OnclickSelect} label="Select">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 3l14 9-7 1-4 7z" />
          </svg>
        </ToolButton>

        <Divider />

        <ToolButton name="Rectangle" active={DrawingObject === "Rectangle"} onClick={(e) => SetDrawingObject(e.currentTarget.name)} label="Rect">
          <div className="w-4 h-3 rounded-sm" style={{ border: `2px solid ${DrawingObject === "Rectangle" ? "white" : "#b0b0be"}` }} />
        </ToolButton>

        <ToolButton name="Ellipse" active={DrawingObject === "Ellipse"} onClick={(e) => SetDrawingObject(e.currentTarget.name)} label="Ellipse">
          <div className="w-3.5 h-3.5 rounded-full" style={{ border: `2px solid ${DrawingObject === "Ellipse" ? "white" : "#b0b0be"}` }} />
        </ToolButton>

        <ToolButton name="Diamond" active={DrawingObject === "Diamond"} onClick={(e) => SetDrawingObject(e.currentTarget.name)} label="Diamond">
          <div className="w-3 h-3 rotate-45 rounded-[1px]" style={{ border: `2px solid ${DrawingObject === "Diamond" ? "white" : "#b0b0be"}` }} />
        </ToolButton>

        <ToolButton name="Line" active={DrawingObject === "Line"} onClick={(e) => SetDrawingObject(e.currentTarget.name)} label="Line">
          <div className="w-4 h-0.5 -rotate-[30deg]" style={{ background: DrawingObject === "Line" ? "white" : "#b0b0be" }} />
        </ToolButton>

        <ToolButton name="Arrow" active={DrawingObject === "Arrow"} onClick={(e) => SetDrawingObject(e.currentTarget.name)} label="Arrow">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="19" x2="19" y2="5" />
            <polyline points="9 5 19 5 19 15" />
          </svg>
        </ToolButton>

        <Divider />

        <ToolButton name="pencil" active={DrawingObject === "pencil"} onClick={(e) => SetDrawingObject(e.currentTarget.name)} label="Pencil">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </svg>
        </ToolButton>

        <ToolButton name="text" active={DrawingObject === "text"} onClick={(e) => SetDrawingObject(e.currentTarget.name)} label="Text">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="4 7 4 4 20 4 20 7" />
            <line x1="9" y1="20" x2="15" y2="20" />
            <line x1="12" y1="4" x2="12" y2="20" />
          </svg>
        </ToolButton>

        <Divider />

        <ToolButton name="earser" active={DrawingObject === "earser"} onClick={(e) => SetDrawingObject(e.currentTarget.name)} label="Erase">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 20H7L3 16l10-10 7 7-4 4" />
            <path d="M6 10l8 8" />
          </svg>
        </ToolButton>
      </div>

      {/* Bottom Right Zoom */}
      <div
        className="absolute bottom-[70px] right-3.5 z-50 flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs"
        style={{
          background: "#26262c",
          border: "1px solid #38383f",
          boxShadow: "0 1px 6px rgba(0,0,0,0.4)",
          color: "#888898",
        }}
      >
        <button
          className="w-5 h-5 rounded flex items-center justify-center text-sm"
          style={{ background: "#32323a", border: "1px solid #38383f", color: "#b0b0be" }}
        >
          −
        </button>
        <span className="font-semibold min-w-[34px] text-center" style={{ color: "#c0c0cc" }}>
          100%
        </span>
        <button
          className="w-5 h-5 rounded flex items-center justify-center text-sm"
          style={{ background: "#32323a", border: "1px solid #38383f", color: "#b0b0be" }}
        >
          +
        </button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-screen h-screen"
        style={{
          background: "transparent",
          cursor:
            DrawingObject === "select" ? "pointer" :
              DrawingObject === "earser" ? "cell" : "crosshair",
        }}
        onMouseDown={getMouseDown}
        onMouseMove={getMouseMove}
        onMouseUp={getMouseUp}
      />
    </div>
  );
}