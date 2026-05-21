"use client";

import {
  useRef,
  useState,
  useEffect,
  MouseEvent,
} from "react";

import { useParams } from "next/navigation";

import { Rectangle } from "../../lib/Rectangle";
import { Drawing } from "../../lib/Drawing";
import { DrawLine } from "../../lib/DrawLine";

import { useSocket } from "../../Context-API/UseSocket";

export default function Collaboration() {

  const params = useParams();


  type DrawRectType = {
    type: "Rectangle";
    Startx: number;
    Starty: number;
    endX: number;
    endY: number;
    color: string;
  };

  type DrawLineType = {
    type: "Line";
    Startx: number;
    Starty: number;
    endX: number;
    endY: number;
    color: string;
  };

  type DrawPencilType = {
    type: "Pencil";
    points: {
      x: number;
      y: number;
    }[];
    color: string;
  };

  type ElementsType =
    | DrawRectType
    | DrawLineType
    | DrawPencilType;


  const [elements, SetElements] = useState<ElementsType[]>([]);

  const [isDrawing, SetisDrawing] = useState(false);

  const [DrawingObject, SetDrawingObject] = useState("Rectangle");

  const [Color, SetColor] =
    useState("black");

  const [points, SetPoints] =
    useState({
      x: 0,
      y: 0,
    });

  const [pencil, SetPencil] =
    useState<{ x: number; y: number }[]>([]);

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

    ClearCanvas(ctx);

  }, [elements]);


  // clearing and drawing 
  const ClearCanvas = (
    ctx:
      | CanvasRenderingContext2D
      | null
      | undefined
  ) => {

    if (!ctx || !canvasRef.current) return;

    ctx.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    ctx.fillStyle = "#1e1e1e";

    ctx.fillRect(
      0, 0, canvasRef.current.width, canvasRef.current.height
    );

    for (const element of elements) {

      if (element.type === "Rectangle") {

        Rectangle(
          ctx,
          element.Startx,
          element.Starty,
          element.endX,
          element.endY,
          true,
          element.color
        );

      }

      else if (element.type === "Line") {

        DrawLine(
          ctx,
          element.Startx,
          element.Starty,
          element.endX,
          element.endY,
          true,
          element.color
        );

      }

      else if (element.type === "Pencil") {

        const points = element.points;

        for (
          let i = 1;
          i < points.length;
          i++
        ) {

          const prev = points[i - 1];
          const curr = points[i];

          if (!prev || !curr) continue;

          Drawing(
            ctx,
            prev.x,
            prev.y,
            curr.x,
            curr.y,
            true,
            element.color
          );

        }

      }

    }

  };


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

    SetPoints({
      x: startX,
      y: startY,
    });

    if (DrawingObject === "pencil") {

      SetPencil([
        {
          x: startX,
          y: startY,
        },
      ]);

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

      ClearCanvas(ctx);

      if (
        DrawingObject === "Rectangle"
      ) {

        Rectangle(
          ctx,
          points.x,
          points.y,
          newX,
          newY,
          true,
          Color
        );

      } else {

        DrawLine(
          ctx,
          points.x,
          points.y,
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
        points.x,
        points.y,
        newX,
        newY,
        true,
        Color
      );

      SetPencil((prev) => [
        ...prev,
        {
          x: newX,
          y: newY,
        },
      ]);

      SetPoints({
        x: newX,
        y: newY,
      });

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
        type: DrawingObject as
          | "Rectangle"
          | "Line",

        Startx: points.x,
        Starty: points.y,
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
        type: "Pencil" as const,
        points: pencil,
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

      SetPencil([]);

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
    <div className="w-screen h-screen bg-[#1e1e1e] overflow-hidden flex">

      {/* Toolbar */}

      <div className="absolute left-1/2 top-2 -translate-x-1/2 z-50">

        <div className="bg-[#2b2b2b] border border-neutral-700 shadow-2xl rounded-2xl p-3 flex gap-3">

          {[
            "Rectangle",
            "Line",
            "pencil",
          ].map((tool) => (

            <button
              key={tool}
              name={tool}
              onClick={(e) =>
                SetDrawingObject(
                  e.currentTarget.name
                )
              }
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${DrawingObject === tool
                  ? "bg-white text-black"
                  : "bg-[#3a3a3a] text-white hover:bg-[#4a4a4a]"
                }
              `}
            >
              {tool}
            </button>

          ))}

        </div>

      </div>

      {/* Colors */}

      <div className="absolute top-1/3 left-20 -translate-x-1/2 z-50">

        <div className="bg-[#2b2b2b] border border-neutral-700 shadow-2xl rounded-2xl px-4 py-3 flex flex-col gap-3">

          {colors.map((color) => (

            <button
              key={color}
              name={color}
              onClick={(e) =>
                SetColor(
                  e.currentTarget.name
                )
              }
              className={`
                w-6 h-6 rounded-xl border-4 transition-all
                ${colorClasses[color]}
                ${Color === color
                  ? "border-white scale-110"
                  : "border-transparent"
                }
              `}
            />

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
  );
}