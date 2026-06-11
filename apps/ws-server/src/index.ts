import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { prisma } from "@repo/db/client";

import { Redis } from "ioredis"

dotenv.config();

const io = new Server(8000, {
  cors: {
    origin: "*",
  },
});

const redis = new Redis();

redis.on("connect", () => {
      console.log("Redis connected");
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

      socket.join(roomId);

    try {

      //   const cachedRoom  = await redis?.get(`room:${roomId}`) ; 
      //   const cachedMessages = await redis?.get(`message:${roomId}`)  ; 
      //  if(cachedRoom && cachedMessages) return socket.emit("room-data" , {
      //     elements : JSON.parse(cachedRoom) , 
      //     messages : JSON.parse(cachedMessages)
      //  })

       
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

      const messages = await prisma.message.findMany({where :{
        roomId : roomId 
      } , select :{
          Text : true  , 
          userId : true 
      }})

      //save it ono redis 

    // await redis.set(`message:${roomId}`, JSON.stringify(messages));
    // await redis.set(`room:${roomId}`, JSON.stringify(room.elements)); 
      // send previous elements
      socket.emit("room-data", {
        elements: room.elements,
        messages : messages        
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

  socket.on("share-elements",async ({ roomId, elements }) => {
      if (!socket.rooms.has(roomId)) return;
    socket.to(roomId).emit("receive-elements", {
      elements,
    });
    // await redis.del(`room:${roomId}`) ; 
  });

  
  socket.on("save-elements",async ({ roomId, elements }) => {
 
      try {

        await prisma.room.update({
          where: {
            id: roomId,
          },
          data: {
            elements,
          }
        });

      } catch (err) {

        console.log(err);

        socket.emit("error", {
          message: "Failed to save room",
        });

      }

    }
  );
  
  socket.on("send-message" , async ({  roomId , text } : { roomId : string , text : string })=> {
      //frist find the user in room 
      try{ 
          await prisma.message.create( {
            data : {
              roomId : roomId , 
              userId : socket.data.userId as string , 
              Text : text , 
              updatedAt  : new Date 
            }
          })
          socket.to(roomId).emit("send-message" , {text}) ;
      }catch(err){
        socket.emit("error", {
          message: "Failed to save room",
        });
      }

  } )
  socket.on("disconnect", () => {

    console.log(
      `User disconnected: ${socket.data.userId}`
    );

  });

});


console.log("WebSocket server running on port 8000");