"use client";

import { useEffect , useState  } from "react";
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
  const SendMessage = ()=>{
    console.log(text); 
    console.log("function called ")
    socket?.emit("message" , text) ; 
    Settext("")
  }
  const [text ,Settext] = useState<string>(""); 
  const [messages , Setmessages] = useState<string[]>([]) ; 
  const SetOnchange = (t : React.ChangeEvent<HTMLInputElement>)=>{
     Settext(t.target.value) ; 
  }
  socket?.on("message" , (data)=> {
    Setmessages([...messages , data]) ; 
  })
  return <>
    <div> 
      <h2>Drawing Board </h2> 
      <input 
       type="string" 
       name="text" 
       value={text} 
       onChange={SetOnchange}
      ></input> 
      <button 
       onClick={SendMessage}
      >Send</button> 
      {messages.length !=0 && <div>
          {messages.map((each)=> 
          <p>{each}</p>)}
         </div>}
    </div>
  </>;
}