"use client"
import axios from "axios" 
import { useState } from "react"
export default function Register(){
    const [user , SetUser] = useState<{UserName : string , password : string }>({
        UserName : "" , 
        password : ""
    }) 
    const [error , SetError] = useState<String | null>(null) ; 
    const SetOnchange = (target : React.ChangeEvent<HTMLInputElement>)=>{
       SetUser({...user , [target.target.name]: target.target.value})
    }
    const OnSubmit = async () =>{
        console.log(user.UserName , user.password) 
        try{
          const response = await axios.put("http://localhost:3003/signup" , user , {
            withCredentials: true 
          })
          console.log(response.data)
          if(response.status){
            alert(response.data.messae) ; 
          }else {
            SetError(response.data.message)
          }
        }catch(err){
            console.log(err)
            SetError("Internal server error")
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
                    value={user.UserName} name="UserName" 
                    onChange={SetOnchange}></input>
                    <label>Password </label>
                    <input  
                    value={user.password} name="password" 
                    onChange={SetOnchange}></input>
                    <button 
                    onClick={()=>OnSubmit()}
                    className=" text-center m-1.5 pointer-cursor hover:text-lg ">
                        Submit
                    </button>
                 </div>
             </div>
         </div>
        </>
    )
}