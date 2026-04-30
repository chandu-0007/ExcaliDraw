import {Server} from "socket.io"

const io = new Server( 8000 )

io.on("connection" , (socket) =>{
    console.log(`ws-server is runnig on 8000 `) ; 
    console.log(`socket is ${socket.id}`)
})