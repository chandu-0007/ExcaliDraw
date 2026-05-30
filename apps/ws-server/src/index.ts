import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { prisma } from "@repo/db/client";

dotenv.config();

const io = new Server(8000, {
  cors: {
    origin: "*",
  },
});


io.use((socket, next) => {

  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {

    const jwtSecret = process.env.JWT_SECRET as string;

    const decoded = jwt.verify(token, jwtSecret) as {
      id: string;
    };

    socket.data.userId = decoded.id;

    next();

  } catch (err) {

    next(new Error("Authentication error"));

  }

});


io.on("connection", (socket: Socket) => {

  console.log("User connected:", socket.data.userId);



  socket.on("join-room", async ({ roomId } : {roomId : string }) => {
    console.log("join room is called ")
    try {

      const room = await prisma.room.findUnique({
        where: {
          id: roomId,
        },
      });

      if (!room) {

        return socket.emit("error", {
          message: "Room not found",
        });

      }

      // join socket room
      socket.join(roomId);

      // send previous elements
      socket.emit("room-data", {
        elements: room.elements,
      });

      console.log(
        `User ${socket.data.userId} joined room ${roomId}`
      );

    } catch (err) {

      console.log(err);

      socket.emit("error", {
        message: "Internal server error",
      });

    }

  });

  socket.on("share-element", ({ roomId, element }) => {
     console.log(element) ; 
    socket.to(roomId).emit("receive-element", {
      element,
    });

  });


  socket.on("save-elements",async ({ roomId, elements }) => {

      try {

        await prisma.room.update({
          where: {
            id: roomId,
          },
          data: {
            elements,
          },
        });

      } catch (err) {

        console.log(err);

        socket.emit("error", {
          message: "Failed to save room",
        });

      }

    }
  );
  
  socket.on("disconnect", () => {

    console.log(
      `User disconnected: ${socket.data.userId}`
    );

  });

});

console.log("WebSocket server running on port 8000");