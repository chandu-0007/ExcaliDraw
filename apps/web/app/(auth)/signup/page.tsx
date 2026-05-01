"use client"
import axios from "axios" 
import { useState } from "react"
export default function Register(){
    const [user , SetUser] = useState<{username : string , password : string }>({
        username : "" , 
        password : ""
    }) 
    const [error , SetError] = useState<String | null>(null) ; 
    const SetOnchange = (target : React.ChangeEvent<HTMLInputElement>)=>{
       SetUser({...user , [target.target.name]: target.target.value})
    }
    const OnSubmit = async () =>{
        console.log(user.username , user.password) 
        try{
          const response = await axios.post("api/signup" , user )
          console.log(response.data)    
          if(response.status == 200 ){
            alert(response.data.messae) ; 
          }else {
            SetError(response.data.message)
          }
        }catch(err){
            console.log(err)
        }
    }
    return (
        <>
         <div className=" bg-white h-screen w-screen flex justify-center items-center "> 
             <div 
             className=" bg-neutral-600 p-3 ">
                 <div 
                 className="flex-col "> 
                    <h3> Sign UP </h3>
                    <label>Full Name </label>
                    <input  
                    type="string"
                    value={user.username} name="username" 
                    onChange={SetOnchange}></input>
                    <label>Create Password </label>
                    <input  
                    type="string"
                    value={user.password} name="password" 
                    onChange={SetOnchange}></input>
                    <button 
                    onClick={()=>OnSubmit()}
                    className=" text-center m-1.5 pointer-cursor hover:text-lg ">
                        Submit
                    </button>
                    {error && <p
                    className="text-red text-md "> {error}</p>}
                 </div>
             </div>
         </div>
        </>
    )
}