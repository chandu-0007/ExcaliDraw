"use client";

import { useEffect } from "react";
import { useSocket } from "../Context-API/UseSocket";

export default function DashBoard() {
  const { socket, connect, disconnect } = useSocket();

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    return () => {
      socket.off("connect");
    };
  }, [socket]);

  return <p>Dashboard Page</p>;
}