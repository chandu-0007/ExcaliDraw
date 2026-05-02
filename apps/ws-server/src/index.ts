import {Server, Socket} from "socket.io"
import jwt from "jsonwebtoken"
const io = new Server( 8000 ) 
io.use((socket  , next) =>{
    const token = socket.handshake.auth.token ; 
    if(!token) return next(new Error("Authentication error"))
   try {
    const jwtSceret  = "asdfghjkl" 
    const decoded = jwt.verify(token , jwtSceret) as { id: string } ; 
    if(!decoded) return next(new Error("Authentication error")) 
    socket.data.userId = decoded.id; 
    next(); }catch(err){
        next(new Error("Authentication error"))
    }
})
const OnlieUsers = new Map<string,Socket>(); 
io.on("connection" , (socket) =>{
    OnlieUsers.set(socket.data.userId , socket) ; 
    console.log(`ws-server is runnig on 8000 `) ; 
    console.log(`socket is ${socket.id}`)  
    socket.on("message" , (playload)=>{
        OnlieUsers.forEach((UserSocket) =>{
           UserSocket.emit("message" , playload) ; 
        })
    })
})