"use client"
import {createContext, useState, Dispatch, SetStateAction } from "react";
type contextType = {
    UserName: string,
    id: string,
    SetUserInfo: (username : string , id : string )=> void ;
}

export type UserType = {
    UserName: string,
    id: string,
}
const UserContext = createContext<contextType | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [UserDetails, SetUserDetails] = useState<UserType>({
        UserName: "",
        id: ""
    })
    function SetUserInfo(username  : string , id : string  ){
       if(username == null || id == null ) return ; 
       SetUserDetails({
        UserName : username , 
         id : id 
       })
       return ; 
    }
    return <UserContext.Provider value={{ UserName:UserDetails.UserName, id: UserDetails.id, SetUserInfo  }}>
        {children}
    </UserContext.Provider>
}

export default  UserContext ; 