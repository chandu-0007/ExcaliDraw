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
import duplicateElement from "../../lib/duplicateElement";
import axios from "axios";

export default function Collaboration() {
  const params = useParams();

  const [elements, SetElements] = useState<ElementsType[]>([]);
  const elementsRef = useRef<ElementsType[]>([]);

  const isDrawing = useRef<boolean>(false);
  const [DrawingObject, SetDrawingObject] = useState<string>("Rectangle");
  const [Color, SetColor] = useState("black");
  const strokColor = useRef<string>("#e8e8f0");
  const strokWidth = useRef<number>(3);

  const SelectElement = useRef<ElementsType | null>(null);

  const [SelectElementState, setSelectElementState] = useState<ElementsType | null>(null);

  const SetPoints = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const SetPencil = useRef<{ x: number; y: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const earserRef = useRef<boolean>(false);
  const dragRef = useRef({ x: 0, y: 0 });


  const [textInput, setTextInput] = useState<{
    screenX: number;
    screenY: number;
    canvasX: number;
    canvasY: number;
    visible: boolean;
  }>({ screenX: 0, screenY: 0, canvasX: 0, canvasY: 0, visible: false });
  const textDivRef = useRef<HTMLDivElement>(null);

  
  const [messages, Setmessages] = useState<{ Text: string; id: string }[]>([]);
  const { socket, connect, disconnect } = useSocket();
  const [Input, SetInput] = useState<string>("");

  const User = useRef<string>("");
  const [Logout, SetLogout] = useState(false);

  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);


  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;

    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/profile");
        if (res.status === 200) User.current = res.data.UserName;
      } catch (_) {}
    };
    fetchUser();
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
      // Attach stable ids to messages that may lack them
      Setmessages((data.messages || []).map(m => ({ ...m, id: generateUUID() })));
    };
    const receiveHandler = (data: { elements: ElementsType[] }) => {
      SetElements(data.elements);
    };
    const messageshandler = (data: { text: string }) => {
      Setmessages(prev => [...prev, { Text: data.text, id: generateUUID() }]);
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

  // ── Auto-save elements via socket ──────────────────────────
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        if (!SelectElementState) return;
        const dup = duplicateElement(SelectElementState);
        if (!dup) return;
        SetElements(prev => [...prev, dup]);
        SelectElement.current = dup;
        setSelectElementState(dup);
        socket?.emit("share-elements", {
          roomId: params.slug,
          elements: [...elementsRef.current, dup],
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [SelectElementState, socket]);

  const MoveObject = (mouseX: number, mouseY: number) => {
    if (!SelectElement.current) return;

    const dx = mouseX - dragRef.current.x;
    const dy = mouseY - dragRef.current.y;
    dragRef.current = { x: mouseX, y: mouseY };

    SetElements(prev =>
      prev.map(el => {
        if (el.id !== SelectElement.current?.id) return el;
        switch (el.type) {
          case "Rectangle":
          case "Line":
          case "Arrow":
            return { ...el, Startx: el.Startx + dx, Starty: el.Starty + dy, endX: el.endX + dx, endY: el.endY + dy };
          case "Ellipse":
            return { ...el, centerX: el.centerX + dx, centerY: el.centerY + dy };
          case "text":
            return { ...el, x: el.x + dx, y: el.y + dy };
          default:
            return el;
        }
      })
    );

    socket?.emit("share-elements", { roomId: params.slug, elements: elementsRef.current });
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
      const mouseY = e.clientY - rect.top;
      const found = handleSelect(elements, mouseX, mouseY);
      SelectElement.current = found ?? null;
      setSelectElementState(found ?? null);
      dragRef.current = { x: mouseX, y: mouseY };
      return;
    }

    if (DrawingObject === "text") {
      setTextInput({
        screenX: e.clientX,
        screenY: e.clientY,
        canvasX: e.clientX - rect.left,
        canvasY: e.clientY - rect.top,
        visible: true,
      });
      setTimeout(() => textDivRef.current?.focus(), 0);
      return;
    }

    SetPoints.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    if (DrawingObject === "pencil") {
      SetPencil.current = [{ x: e.clientX - rect.left, y: e.clientY - rect.top }];
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
      const found = handleSelect(elementsRef.current, newX, newY);
      if (found) {
        const updated = EarseElement(elementsRef.current, found.id);
        SetElements(updated);
        socket?.emit("share-elements", { roomId: params.slug, elements: updated });
      }
      return;
    }

    if (DrawingObject === "select" && SelectElement.current) {
      MoveObject(newX, newY);
      return;
    }

    if (!isDrawing.current) return;

    switch (DrawingObject) {
      case "Rectangle":
        ClearCanvas(canvasRef, elementsRef.current);
        Rectangle(ctx, SetPoints.current.x, SetPoints.current.y, newX, newY, Color, strokColor.current, strokWidth.current);
        break;
      case "Line":
        ClearCanvas(canvasRef, elementsRef.current);
        DrawLine(ctx, SetPoints.current.x, SetPoints.current.y, newX, newY, Color, strokWidth.current);
        break;
      case "Ellipse":
        ClearCanvas(canvasRef, elementsRef.current);
        drawCircle(ctx, SetPoints.current.x, SetPoints.current.y,
          findDistance(SetPoints.current.x, SetPoints.current.y, newX, newY),
          Color, strokColor.current, strokWidth.current);
        break;
      case "Arrow":
        ClearCanvas(canvasRef, elementsRef.current);
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
    earserRef.current = false;

    if (DrawingObject === "select" && SelectElement.current) {
      SelectElement.current = null;
      setSelectElementState(null);
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
      case "Arrow":
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
        newElement = {
          id: generateUUID(), type: DrawingObject,
          centerX: SetPoints.current.x, centerY: SetPoints.current.y,
          radius: findDistance(SetPoints.current.x, SetPoints.current.y, newX, newY),
          color: Color, strokColor: strokColor.current, strokWidth: strokWidth.current,
        };
        break;
    }

    if (newElement) {
      SetElements(prev => [...prev, newElement!]);
      socket?.emit("share-elements", {
        roomId: params.slug,
        elements: [...elementsRef.current, newElement],
      });
    }
  };

  const commitText = () => {
    const value = textDivRef.current?.innerText.trim();
    if (value) {
      const newEl: ElementsType = {
        id: generateUUID(),
        type: "text",
        x: textInput.canvasX,
        y: textInput.canvasY,
        text: value,
        color: Color || "#e8e8f0",
        fontSize: strokWidth.current * 6 + 14,
      };
      SetElements(prev => {
        const updated = [...prev, newEl];
        socket?.emit("share-elements", { roomId: params.slug, elements: updated });
        return updated;
      });
    }
    if (textDivRef.current) textDivRef.current.innerText = "";
    setTextInput({ screenX: 0, screenY: 0, canvasX: 0, canvasY: 0, visible: false });
  };

  const handleTextKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      if (textDivRef.current) textDivRef.current.innerText = "";
      setTextInput({ screenX: 0, screenY: 0, canvasX: 0, canvasY: 0, visible: false });
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      commitText();
    }
  };

  const SendMessageHandler = () => {
    if (!Input.trim()) return;
    Setmessages(prev => [...prev, { Text: Input, id: generateUUID() }]);
    socket?.emit("send-message", { roomId: params.slug, text: Input });
    SetInput("");
  };

  const DeleteMessageHandler = (id: string) => {
    Setmessages(prev => prev.filter(m => m.id !== id));
  };

  const handleLogout = async () => {
    await axios.post("/api/logout");
    window.location.reload();
  };

  const OnclickSelect = () => {
    isDrawing.current = false;
    SelectElement.current = null;
    setSelectElementState(null);
    SetDrawingObject("select");
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
      <div className="absolute top-3 left-0 right-0 flex items-center justify-between px-4 z-50">
        <div
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold tracking-tight"
          style={{ background: "#26262c", border: "1px solid #38383f", color: "#e8e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: "#7c78e8" }} />
          CollabCanvas
        </div>
        <div className="flex items-center gap-2">
          <div
            onClick={() => SetLogout(!Logout)}
            className="rounded-full bg-neutral-700 text-white text-2xl font-serif shadow-sm hover:cursor-pointer w-9 h-9 flex items-center justify-center"
          >
            {User.current.substring(0, 1).toUpperCase() || "?"}
          </div>
        </div>
      </div>

      {/* ── User Dropdown ── */}
      {Logout && (
        <div className="absolute right-4 top-16 bg-neutral-700 shadow-lg rounded-xl p-4 w-60 z-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#7c78e8] text-white flex items-center justify-center font-semibold text-lg">
              {User.current.substring(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-white">{User.current}</p>
              <p className="text-xs text-neutral-400">Collaborating</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full bg-red-500 text-white py-2 rounded-lg text-sm font-semibold">
            Logout
          </button>
        </div>
      )}

      {/* ── Left Color Panel ── */}
      <div
        className="absolute left-3.5 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-2 px-2 py-2.5 rounded-xl"
        style={{ background: "#26262c", border: "1px solid #38383f", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
      >
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
            key={c} title={label}
            onClick={() => { strokColor.current = c; }}
            className="w-6 h-6 rounded-md transition-transform"
            style={{ background: c, border: `2px solid ${strokColor.current === c ? "#e8e8f0" : "transparent"}` }}
          />
        ))}

        <div className="w-7 h-px" style={{ background: "#38383f" }} />
        <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#555560" }}>Fill</span>

        {[
          { c: "#2a2a32", label: "None", dashed: true },
          { c: "#3d2c00", label: "Dark Orange" },
          { c: "#1a3a22", label: "Dark Green" },
          { c: "#2a2050", label: "Dark Purple" },
          { c: "black", label: "Black" },
          { c: "white", label: "White" },
          { c: "#CC0033", label: "Red" },
        ].map(({ c, label, dashed }) => (
          <button
            key={c} title={label}
            onClick={() => SetColor(c)}
            className="w-6 h-6 rounded-md transition-transform"
            style={{ background: c, border: dashed ? "1.5px dashed #555" : `2px solid ${Color === c ? "#e8e8f0" : "transparent"}` }}
          />
        ))}

        <div className="w-7 h-px" style={{ background: "#38383f" }} />
        <span className="text-[9px] font-semibold uppercase tracking-wider text-white">Size</span>

        {[6, 8, 10].map((size, i) => (
          <button
            key={size}
            className="rounded-full transition-transform"
            onClick={() => { strokWidth.current = size - 3; }}
            style={{ width: size, height: size, background: i === 0 ? "#7c78e8" : "#888898" }}
          />
        ))}
      </div>

      {/* ── Bottom Toolbar ── */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-3 py-2 rounded-2xl"
        style={{ background: "#26262c", border: "1px solid #38383f", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
      >
        <ToolButton name="select" active={DrawingObject === "select"} onClick={OnclickSelect} label="Select">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 3l14 9-7 1-4 7z" />
          </svg>
        </ToolButton>
        <Divider />
        <ToolButton name="Rectangle" active={DrawingObject === "Rectangle"} onClick={e => SetDrawingObject(e.currentTarget.name)} label="Rect">
          <div className="w-4 h-3 rounded-sm" style={{ border: `2px solid ${DrawingObject === "Rectangle" ? "white" : "#b0b0be"}` }} />
        </ToolButton>
        <ToolButton name="Ellipse" active={DrawingObject === "Ellipse"} onClick={e => SetDrawingObject(e.currentTarget.name)} label="Ellipse">
          <div className="w-3.5 h-3.5 rounded-full" style={{ border: `2px solid ${DrawingObject === "Ellipse" ? "white" : "#b0b0be"}` }} />
        </ToolButton>
        <ToolButton name="Diamond" active={DrawingObject === "Diamond"} onClick={e => SetDrawingObject(e.currentTarget.name)} label="Diamond">
          <div className="w-3 h-3 rotate-45 rounded-[1px]" style={{ border: `2px solid ${DrawingObject === "Diamond" ? "white" : "#b0b0be"}` }} />
        </ToolButton>
        <ToolButton name="Line" active={DrawingObject === "Line"} onClick={e => SetDrawingObject(e.currentTarget.name)} label="Line">
          <div className="w-4 h-0.5 -rotate-[30deg]" style={{ background: DrawingObject === "Line" ? "white" : "#b0b0be" }} />
        </ToolButton>
        <ToolButton name="Arrow" active={DrawingObject === "Arrow"} onClick={e => SetDrawingObject(e.currentTarget.name)} label="Arrow">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="19" x2="19" y2="5" />
            <polyline points="9 5 19 5 19 15" />
          </svg>
        </ToolButton>
        <Divider />
        <ToolButton name="pencil" active={DrawingObject === "pencil"} onClick={e => SetDrawingObject(e.currentTarget.name)} label="Pencil">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </svg>
        </ToolButton>
        <ToolButton name="text" active={DrawingObject === "text"} onClick={e => SetDrawingObject(e.currentTarget.name)} label="Text">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="4 7 4 4 20 4 20 7" />
            <line x1="9" y1="20" x2="15" y2="20" />
            <line x1="12" y1="4" x2="12" y2="20" />
          </svg>
        </ToolButton>
        <Divider />
        <ToolButton name="earser" active={DrawingObject === "earser"} onClick={e => SetDrawingObject(e.currentTarget.name)} label="Erase">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 20H7L3 16l10-10 7 7-4 4" />
            <path d="M6 10l8 8" />
          </svg>
        </ToolButton>
      </div>

      {/* ── Zoom ── */}
      <div
        className="absolute bottom-[70px] right-3.5 z-50 flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs"
        style={{ background: "#26262c", border: "1px solid #38383f", boxShadow: "0 1px 6px rgba(0,0,0,0.4)", color: "#888898" }}
      >
        <button className="w-5 h-5 rounded flex items-center justify-center text-sm"
          style={{ background: "#32323a", border: "1px solid #38383f", color: "#b0b0be" }}>−</button>
        <span className="font-semibold min-w-[34px] text-center" style={{ color: "#c0c0cc" }}>100%</span>
        <button className="w-5 h-5 rounded flex items-center justify-center text-sm"
          style={{ background: "#32323a", border: "1px solid #38383f", color: "#b0b0be" }}>+</button>
      </div>

      {/* ── Chat ── */}
      <div className="w-[260px] h-fit bg-[#1a1a2e] rounded-xl absolute top-14 right-6 border border-[#2a2a3e] flex flex-col overflow-hidden shadow-xl z-50">
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#2a2a3e]">
          <div className="w-2 h-2 rounded-full bg-[#1D9E75]" />
          <span className="text-[13px] font-medium text-[#e2e2e8] flex-1">Collaborators</span>
        </div>
        <div className="flex flex-col gap-2 p-3 min-h-[180px] max-h-[220px] overflow-y-auto">
          {messages.map(child => (
            <div key={child.id} className="flex flex-col gap-0.5 max-w-[82%]">
              <div className="flex px-3 py-1.5 justify-between items-center rounded-xl text-[12px] leading-relaxed text-[#e2e2e8] bg-[#2a2a3e] gap-2">
                <span className="flex-1 break-words">{child.Text}</span>
                <button
                  onClick={() => DeleteMessageHandler(child.id)}
                  className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0 leading-none"
                  title="Delete message"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 px-3 py-2.5 border-t border-[#2a2a3e]">
          <input
            value={Input}
            onChange={e => SetInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && SendMessageHandler()}
            placeholder="Message..."
            className="flex-1 bg-[#2a2a3e] border border-[#3a3a4e] rounded-full px-3 py-1.5 text-[12px] text-[#e2e2e8] placeholder-[#6b6b80] outline-none focus:border-[#1D9E75]"
          />
          <button
            onClick={SendMessageHandler}
            className="w-8 h-8 rounded-full bg-[#1D9E75] hover:bg-[#0F6E56] flex items-center justify-center flex-shrink-0 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>

      {textInput.visible && (
        <div
          ref={textDivRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={commitText}
          onKeyDown={handleTextKeyDown}
          spellCheck={false}
          style={{
            position: "fixed",
            left: textInput.screenX,
            top: textInput.screenY,
            fontFamily: "'Caveat', cursive",
            fontSize: `${strokWidth.current * 6 + 14}px`,
            lineHeight: 1.2,
            color: Color || "#e8e8f0",
            minWidth: "2px",
            maxWidth: "500px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            background: "transparent",
            border: "none",
            outline: "none",
            padding: "0",
            margin: "0",
            caretColor: Color || "#e8e8f0",
            borderBottom: "1.5px dashed rgba(124,120,232,0.6)",
            zIndex: 100,
            cursor: "text",
          }}
        />
      )}

      {/* ── Canvas ── */}
      <canvas
        ref={canvasRef}
        className="w-screen h-screen"
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