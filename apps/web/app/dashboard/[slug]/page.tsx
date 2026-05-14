"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSocket } from "../../Context-API/UseSocket";

export default function Collaboration() {
  const params = useParams();
  const [message, setMessage] = useState<string>("");

  const { socket, connect, disconnect } = useSocket();

  // connect socket
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  // socket events
  useEffect(() => {
    if (!socket) return;

    socket.emit("message", "hello world");

    const handleMessage = (data: string) => {
      console.log(data);
      setMessage(data);
    };

    socket.on("message", handleMessage);

    return () => {
      socket.off("message", handleMessage);
    };
  }, [socket]);

  return (
    <div className="bg-black text-white text-center flex items-center justify-center h-screen w-screen">
      <h2>
        Collaboration board {params.slug} and {message}
      </h2>
    </div>
  );
}