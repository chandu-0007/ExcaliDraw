"use client";

import {
  useRef,
  useState,
  useEffect,
  MouseEvent,
} from "react";
import { ClearCanvas } from "../../lib/ClearCanvas";
import { ToolButton, Divider } from "../../components/toollButton";
import { useParams } from "next/navigation";
import { generateUUID } from "../../lib/generateUUID"
import { Rectangle } from "../../lib/Rectangle";
import { Drawing } from "../../lib/Drawing";
import { DrawLine } from "../../lib/DrawLine";

import { useSocket } from "../../Context-API/UseSocket";
import type {
  ElementsType
} from "@repo/common";
import { number } from "framer-motion";
export default function Collaboration() {

  const params = useParams();

  const [elements, SetElements] = useState<ElementsType[]>([]);

  const [isDrawing, SetisDrawing] = useState(false);

  const [DrawingObject, SetDrawingObject] = useState("Rectangle");

  const [Color, SetColor] =
    useState("black");

  const  SetPoints =useRef<{ x: number, y: number }>({
      x : 0 , 
      y : 0 
    });

  const  SetPencil=
    useRef<{ x: number; y: number }[]>([]);

  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  const { socket, connect, disconnect } =
    useSocket();

  const colors = [
    "black",
    "red",
    "blue",
    "yellow",
    "green",
  ] as const;



  useEffect(() => {

    connect();

  }, []);


  useEffect(() => {

    if (!socket) return;

    socket.emit("join-room", {
      roomId: params.slug as string,
    });

    return () => {
      disconnect();
    };

  }, [socket]);



  useEffect(() => {

    if (!socket) return;

    const roomHandler = (
      data: {
        elements: ElementsType[];
      }
    ) => {

      SetElements(data.elements || []);

    };

    const receiveHandler = (
      data: {
        element: ElementsType;
      }
    ) => {

      SetElements((prev) => [
        ...prev,
        data.element,
      ]);

    };

    socket.on("room-data", roomHandler);

    socket.on(
      "receive-element",
      receiveHandler
    );

    return () => {

      socket.off(
        "room-data",
        roomHandler
      );

      socket.off(
        "receive-element",
        receiveHandler
      );

    };

  }, [socket]);


  useEffect(() => {

    if (!socket) return;

    const timeout = setTimeout(() => {

      socket.emit("save-elements", {
        roomId: params.slug,
        elements,
      });

    }, 2000);

    return () => clearTimeout(timeout);

  }, [elements]);


  //saving  with debounce approach 
  useEffect(() => {

    const ctx =
      canvasRef.current?.getContext("2d");

    if (!ctx || !canvasRef.current) return;

    ClearCanvas(canvasRef, elements);

  }, [elements]);




  const getMouseDown = (
    e: MouseEvent<HTMLCanvasElement>
  ) => {

    const react =
      canvasRef.current?.getBoundingClientRect();

    if (!react) return;

    const startX =
      e.clientX - react.left;

    const startY =
      e.clientY - react.top;

    SetPoints.current = {
      x: startX,
      y: startY,
    } ;

    if (DrawingObject === "pencil") {

      SetPencil.current.push({
          x: startX,
          y: startY,
        }
      );

    }

    SetisDrawing(true);

  };

  const getMouseMove = (
    e: MouseEvent<HTMLCanvasElement>
  ) => {

    if (!isDrawing) return;

    const react =
      canvasRef.current?.getBoundingClientRect();

    if (!react) return;

    const ctx =
      canvasRef.current?.getContext("2d");

    if (!ctx) return;

    const newX =
      e.clientX - react.left;

    const newY =
      e.clientY - react.top;

    if (
      DrawingObject === "Rectangle" ||
      DrawingObject === "Line"
    ) {

      ClearCanvas(canvasRef, elements);

      if (
        DrawingObject === "Rectangle"
      ) {

        Rectangle(
          ctx,
          SetPoints.current.x,
          SetPoints.current.y,
          newX,
          newY,
          true,
          Color
        );

      } else {

        DrawLine(
          ctx,
          SetPoints.current.x,
          SetPoints.current.y,
          newX,
          newY,
          true,
          Color
        );

      }

    }

    else if (
      DrawingObject === "pencil"
    ) {

      Drawing(
        ctx,
        SetPoints.current.x,
        SetPoints.current.y,
        newX,
        newY,
        true,
        Color
      );

      SetPencil.current.push( 
        {
          x: newX,
          y: newY,
        },
      );

      SetPoints.current = {
        x: newX,
        y: newY,
      };

    }

  };


  const getMouseUp = (
    e: MouseEvent<HTMLCanvasElement>
  ) => {

    SetisDrawing(false);

    if (!canvasRef.current) return;

    const rect =
      canvasRef.current.getBoundingClientRect();

    const newX =
      e.clientX - rect.left;

    const newY =
      e.clientY - rect.top;

    if (
      DrawingObject === "Rectangle" ||
      DrawingObject === "Line"
    ) {

      const newElement = {
        id: generateUUID(),
        type: DrawingObject as
          | "Rectangle"
          | "Line",
        Startx: SetPoints.current.x,
        Starty: SetPoints.current.y,
        endX: newX,
        endY: newY,
        color: Color,
      };

      SetElements((prev) => [
        ...prev,
        newElement,
      ]);

      socket?.emit(
        "share-element",
        {
          roomId:
            params.slug as string,
          element: newElement,
        }
      );

    }

    else if (
      DrawingObject === "pencil"
    ) {

      const newElement = {
        id: generateUUID(),
        type: "pencil",
        points: SetPencil.current,
        color: Color,
      };

      // SetElements((prev) => [
      //   ...prev,
      //   newElement,
      // ]);

      socket?.emit(
        "share-element",
        {
          roomId:
            params.slug as string,
          element: newElement,
        }
      );

      SetPencil.current = [];

    }

  };


  const colorClasses: Record<
    (typeof colors)[number],
    string
  > = {
    red: "bg-red-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    black: "bg-black",
  };



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
        <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#555560" }}>Fill</span>

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
              border: dashed ? "1.5px dashed #555" : `2px solid transparent`,
            }}
          />
        ))}

        <div className="w-7 h-px" style={{ background: "#38383f" }} />
        <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#555560" }}>Size</span>

        {[6, 9, 13].map((size, i) => (
          <button
            key={size}
            className="rounded-full transition-transform"
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
        {/* <ToolButton name="select" active={DrawingObject === "select"} onClick={OnclickSelect} label="Select">
         <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
           <path d="M5 3l14 9-7 1-4 7z" />
         </svg>
       </ToolButton> */}

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
        <ToolButton name="pencil" active={DrawingObject === "pencil"} onClick={(e) => SetDrawingObject(e.currentTarget.name)} label="pencil">
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