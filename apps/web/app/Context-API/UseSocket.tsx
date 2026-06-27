"use client";

import { useState, createContext, useContext, useRef } from "react";
import { io, Socket } from "socket.io-client";
type SocketContextType = {
  socket: Socket | null;
  connect: () => void; 
  disconnect: () => void;
};

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children  , token }: { children: React.ReactNode , token : string }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const connect = async () => {
    if (socketRef.current) return;
    if (!token) return;
    console.log("socket connection is called ")
    
    const s = io("http://13.49.127.163:8000", {
      withCredentials: true,
      transports: ["websocket"] ,   
      auth :{
        token : token
      }
    } );
  s.on("connect", () => {
    console.log("CONNECTED");
    console.log("Socket ID:", s.id);
    console.log("connected:", s.connected);
  });

  s.on("connect_error", (err) => {
    console.log("CONNECT ERROR");
    console.log(err.message);
  });

  s.on("disconnect", (reason) => {
    console.log("DISCONNECTED:", reason);
  });
    socketRef.current = s;
    setSocket(s);
  };

  const disconnect = () => {
    if (!socketRef.current) return;

    socketRef.current.disconnect();
    socketRef.current = null;
    setSocket(null);
   
  };

  return (
    <SocketContext.Provider value={{ socket, connect, disconnect }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }

  return context;
};