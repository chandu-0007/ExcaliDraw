"use client"
import UserContext from "./Context-API/UserContext"
import { useContext } from "react"
export default function Home (){
  const user = useContext(UserContext)
  console.log(user)
  return (
    <div
      className="flex items-center justify-center h-screen text-black bg-white"
    >
      <h3 className="bg-white">Drawing board</h3>
    </div>
  )
}