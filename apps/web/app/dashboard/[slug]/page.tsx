"use client";

import React, { useRef, useState, useEffect, MouseEvent } from "react";
import { ClearCanvas } from "../../lib/ClearCanvas";
import { ToolButton, Divider } from "../../components/toollButton";
import { useParams } from "next/navigation";
import { generateUUID } from "../../lib/generateUUID";
import { Rectangle } from "../../lib/Rectangle";
import { DrawLine } from "../../lib/DrawLine";
import EarseElement from "../../lib/EaserEelement";
import { useSocket } from "../../Context-API/UseSocket";
import type { ElementsType } from "@repo/common";
import { drawCircle } from "../../lib/DrawCricle";
import { findDistance } from "../../lib/findDistance";
import DrawArrow from "../../lib/DrawArrow";
import { handleSelect } from "../../lib/HandleSelect";

export default function Collaboration() {
  const params = useParams();

  const [elements, SetElements] = useState<ElementsType[]>([]);
  const elementsRef = useRef<ElementsType[]>([]);  // ✅ fix stale closure

  const isDrawing = useRef<boolean>(false);
  const [DrawingObject, SetDrawingObject] = useState<string>("Rectangle");
  const [Color, SetColor] = useState("black");
  const strokColor = useRef<string>("#e8e8f0");
  const strokWidth = useRef<number>(3);

  const SelectElement = useRef<ElementsType | null>(null);
  const SetPoints = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const SetPencil = useRef<{ x: number; y: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const earserRef = useRef<boolean>(false);
  const dragRef = useRef({ x: 0, y: 0 });

  const [messages, Setmessages] = useState<{ Text: string }[]>([]);
  const { socket, connect, disconnect } = useSocket();
  const [Input, SetInput] = useState<string>("");

  // ✅ Keep elementsRef in sync
  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.emit("join-room", { roomId: params.slug as string });
    return () => { disconnect(); };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const roomHandler = (data: { elements: ElementsType[]; messages: { Text: string }[] }) => {
      SetElements(data.elements || []);
      Setmessages(data.messages || []);
    };
    const receiveHandler = (data: { elements: ElementsType[] }) => {
      SetElements(data.elements);
    };
    const messageshandler = (data: { text: string }) => {
      Setmessages((prevs) => [...prevs, { Text: data.text }]);
    };

    socket.on("send-message", messageshandler);
    socket.on("room-data", roomHandler);
    socket.on("receive-elements", receiveHandler);

    return () => {
      socket.off("room-data", roomHandler);
      socket.off("receive-elements", receiveHandler);
      socket.off("send-message", messageshandler);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || elements.length === 0) return;
    const timeout = setTimeout(() => {
      socket.emit("save-elements", { roomId: params.slug, elements });
    }, 2000);
    return () => clearTimeout(timeout);
  }, [elements]);

  useEffect(() => {
    if (!canvasRef.current) return;
    ClearCanvas(canvasRef, elements);
  }, [elements]);

  // ✅ Fixed MoveObject — handles all types
  const MoveObject = (mouseX: number, mouseY: number) => {
    if (!SelectElement.current) return;

    const dx = mouseX - dragRef.current.x;
    const dy = mouseY - dragRef.current.y;
    dragRef.current = { x: mouseX, y: mouseY };

    SetElements((prevs) =>
      prevs.map((element) => {
        if (element.id !== SelectElement.current?.id) return element;

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
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (DrawingObject === "earser") {
      earserRef.current = true;
      return;
    }

    if (DrawingObject === "select") {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;  // ✅ was rect.right — bug fixed
      const found = handleSelect(elements, mouseX, mouseY);
      if (found != null) SelectElement.current = found;
      dragRef.current = { x: mouseX, y: mouseY };
      return;
    }

    SetPoints.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    if (DrawingObject === "pencil") {
      SetPencil.current = [{
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,  // ✅ was rect.right — bug fixed
      }];
    }

    isDrawing.current = true;
  };

  const getMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newX = e.clientX - rect.left;
    const newY = e.clientY - rect.top;
    const ctx = canvasRef.current?.getContext("2d");

    if (DrawingObject === "earser" && earserRef.current) {
      const found = handleSelect(elementsRef.current, newX, newY);  // ✅ use ref
      if (found != null) {
        const updated = EarseElement(elementsRef.current, found.id);
        SetElements(updated);
        socket?.emit("share-elements", { roomId: params.slug, elements: updated });
      }
      return;
    }

    if (DrawingObject === "select" && SelectElement.current != null) {
      MoveObject(newX, newY);
      return;
    }

    if (!isDrawing.current) return;

    switch (DrawingObject) {
      case "Rectangle":
        ClearCanvas(canvasRef, elementsRef.current);  // ✅ use ref
        Rectangle(ctx, SetPoints.current.x, SetPoints.current.y, newX, newY, Color, strokColor.current, strokWidth.current);
        break;
      case "Line":
        ClearCanvas(canvasRef, elementsRef.current);
        DrawLine(ctx, SetPoints.current.x, SetPoints.current.y, newX, newY, Color, strokWidth.current);
        break;
      case "Ellipse":
        ClearCanvas(canvasRef, elementsRef.current);
        const radius = findDistance(SetPoints.current.x, SetPoints.current.y, newX, newY);
        drawCircle(ctx, SetPoints.current.x, SetPoints.current.y, radius, Color, strokColor.current, strokWidth.current);
        break;
      case "Arrow":
        ClearCanvas(canvasRef, elementsRef.current);  // ✅ Arrow was missing
        DrawArrow(ctx, SetPoints.current.x, SetPoints.current.y, newX, newY, Color, strokWidth.current);
        break;
      case "pencil":
        DrawLine(ctx, SetPoints.current.x, SetPoints.current.y, newX, newY, Color, strokWidth.current);
        SetPencil.current.push({ x: newX, y: newY });
        SetPoints.current = { x: newX, y: newY };
        break;
    }
  };

  const getMouseUp = (e: MouseEvent<HTMLCanvasElement>) => {
    // ✅ Always reset earser
    earserRef.current = false;

    if (DrawingObject === "select" && SelectElement.current != null) {
      SelectElement.current = null;
      return;
    }

    isDrawing.current = false;
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left;
    const newY = e.clientY - rect.top;
    let newElement: ElementsType | null = null;

    switch (DrawingObject) {
      case "Rectangle":
        newElement = {
          id: generateUUID(), type: DrawingObject,
          Startx: SetPoints.current.x, Starty: SetPoints.current.y,
          endX: newX, endY: newY,
          color: Color, strokColor: strokColor.current, strokWidth: strokWidth.current,
        };
        break;
      case "Line":
        newElement = {
          id: generateUUID(), type: DrawingObject,
          Startx: SetPoints.current.x, Starty: SetPoints.current.y,
          endX: newX, endY: newY,
          color: Color, strokWidth: strokWidth.current,
        };
        break;
      case "Arrow":  // ✅ Arrow was missing from Collaboration
        newElement = {
          id: generateUUID(), type: DrawingObject,
          Startx: SetPoints.current.x, Starty: SetPoints.current.y,
          endX: newX, endY: newY,
          color: Color, strokWidth: strokWidth.current,
        };
        break;
      case "pencil":
        newElement = {
          id: generateUUID(), type: DrawingObject,
          points: [...SetPencil.current],
          color: Color, strokWidth: strokWidth.current,
        };
        SetPencil.current = [];
        break;
      case "Ellipse":
        const radius = findDistance(SetPoints.current.x, SetPoints.current.y, newX, newY);
        newElement = {
          id: generateUUID(), type: DrawingObject,
          centerX: SetPoints.current.x, centerY: SetPoints.current.y,
          radius, color: Color,
          strokColor: strokColor.current, strokWidth: strokWidth.current,
        };
        break;
    }

    if (newElement != null) {
      SetElements((prev) => [...prev, newElement!]);
      const updatedElements = [...elementsRef.current, newElement];  // ✅ use ref
      socket?.emit("share-elements", { roomId: params.slug, elements: updatedElements });
    }
  };

  const OnclickSelect = () => {
    isDrawing.current = false;
    SelectElement.current = null;
    SetDrawingObject("select");
  };

  const SendMessageHandler = () => {
    if (!Input.trim()) return;
    Setmessages((prevs) => [...prevs, { Text: Input }]);
    socket?.emit("send-message", { roomId: params.slug, text: Input });
    SetInput("");
  };

  return (
    <div className="w-screen h-screen overflow-hidden relative"
      style={{ background: "#1b1b1f", backgroundImage: "radial-gradient(circle, #2e2e35 1px, transparent 1px)", backgroundSize: "20px 20px" }}>

      {/* Top Bar */}
      <div className="absolute top-3 left-0 right-0 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold tracking-tight"
          style={{ background: "#26262c", border: "1px solid #38383f", color: "#e8e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>
          <span className="w-2 h-2 rounded-full" style={{ background: "#7c78e8" }} />
          CollabCanvas
        </div>
      </div>

      {/* Left Color Panel */}
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-2 px-2 py-2.5 rounded-xl"
        style={{ background: "#26262c", border: "1px solid #38383f", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>

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
          <button key={c} title={label}
            onClick={() => strokColor.current = c}  // ✅ wired up
            className="w-6 h-6 rounded-md transition-transform"
            style={{ background: c, border: `2px solid ${strokColor.current === c ? "#e8e8f0" : "transparent"}` }} />
        ))}

        <div className="w-7 h-px" style={{ background: "#38383f" }} />
        <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#555560" }}>Fill</span>

        {[
          { c: "#2a2a32", label: "None", dashed: true },
          { c: "#3d2c00", label: "Dark Orange" },
          { c: "#1a3a22", label: "Dark Green" },
          { c: "#2a2050", label: "Dark Purple" },
          { c: "black", label: "Black" },
        ].map(({ c, label, dashed }) => (
          <button key={c} title={label}
            onClick={() => SetColor(c)}  // ✅ wired up
            className="w-6 h-6 rounded-md transition-transform"
            style={{ background: c, border: dashed ? "1.5px dashed #555" : `2px solid ${Color === c ? "#e8e8f0" : "transparent"}` }} />
        ))}

        <div className="w-7 h-px" style={{ background: "#38383f" }} />
        <span className="text-[9px] font-semibold uppercase tracking-wider text-white">Size</span>

        {[6, 8, 10].map((size, i) => (
          <button key={size}
            className="rounded-full transition-transform"
            onClick={() => strokWidth.current = size - 3}  // ✅ wired up
            style={{ width: size, height: size, background: i === 0 ? "#7c78e8" : "#888898" }} />
        ))}
      </div>

      {/* Bottom Toolbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-3 py-2 rounded-2xl"
        style={{ background: "#26262c", border: "1px solid #38383f", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>

        <ToolButton name="select" active={DrawingObject === "select"} onClick={OnclickSelect} label="Select">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 3l14 9-7 1-4 7z" /></svg>
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
            <line x1="5" y1="19" x2="19" y2="5" /><polyline points="9 5 19 5 19 15" />
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
            <polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
          </svg>
        </ToolButton>
        <Divider />
        <ToolButton name="earser" active={DrawingObject === "earser"} onClick={(e) => SetDrawingObject(e.currentTarget.name)} label="Erase">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 20H7L3 16l10-10 7 7-4 4" /><path d="M6 10l8 8" />
          </svg>
        </ToolButton>
      </div>

      {/* Zoom */}
      <div className="absolute bottom-[70px] right-3.5 z-50 flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs"
        style={{ background: "#26262c", border: "1px solid #38383f", boxShadow: "0 1px 6px rgba(0,0,0,0.4)", color: "#888898" }}>
        <button className="w-5 h-5 rounded flex items-center justify-center text-sm"
          style={{ background: "#32323a", border: "1px solid #38383f", color: "#b0b0be" }}>−</button>
        <span className="font-semibold min-w-[34px] text-center" style={{ color: "#c0c0cc" }}>100%</span>
        <button className="w-5 h-5 rounded flex items-center justify-center text-sm"
          style={{ background: "#32323a", border: "1px solid #38383f", color: "#b0b0be" }}>+</button>
      </div>

      {/* Chat */}
      <div className="w-[260px] h-fit bg-[#1a1a2e] rounded-xl absolute top-10 right-6 border border-[#2a2a3e] flex flex-col overflow-hidden shadow-xl">
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#2a2a3e]">
          <div className="w-2 h-2 rounded-full bg-[#1D9E75]" />
          <span className="text-[13px] font-medium text-[#e2e2e8] flex-1">Collaborators</span>
        </div>
        <div className="flex flex-col gap-2 p-3 min-h-[180px] max-h-[220px] overflow-y-auto">
          {messages.map((child, index) => (
            <div key={index} className="flex flex-col gap-0.5 max-w-[82%] ">
              <div className=" flex px-3 py-1.5 justify-between rounded-xl text-[12px] leading-relaxed text-[#e2e2e8] bg-[#2a2a3e]">
                <span> {child.Text} </span>
                <div  
                  className="text-red-400 hover:cursor-pointer"
                > x  </div>
              </div>
            </div>  
          ))}
        </div>
        <div className="flex items-center gap-2 px-3 py-2.5 border-t border-[#2a2a3e]">
          <input value={Input} onChange={(e) => SetInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && SendMessageHandler()}
            placeholder="Message..."
            className="flex-1 bg-[#2a2a3e] border border-[#3a3a4e] rounded-full px-3 py-1.5 text-[12px] text-[#e2e2e8] placeholder-[#6b6b80] outline-none focus:border-[#1D9E75]" />
          <button onClick={SendMessageHandler}
            className="w-8 h-8 rounded-full bg-[#1D9E75] hover:bg-[#0F6E56] flex items-center justify-center flex-shrink-0 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} className="w-screen h-screen"
        style={{
          background: "transparent",
          cursor: DrawingObject === "select" ? "move" : DrawingObject === "earser" ? "cell" : "crosshair",
        }}
        onMouseDown={getMouseDown}
        onMouseMove={getMouseMove}
        onMouseUp={getMouseUp}
      />
    </div>
  );
}