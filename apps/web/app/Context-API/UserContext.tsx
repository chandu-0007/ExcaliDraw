"use client"
import { useContext, createContext, useState, Dispatch, SetStateAction } from "react";
type contextType = {
    UserName: string,
    id: string,
    SetUserDetails: Dispatch<SetStateAction<UserType>>
}

type UserType = {
    UserName: string,
    id: string,
}
const UserContext = createContext<contextType | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [UserDetails, SetUserDetails] = useState<UserType>({
        UserName: "",
        id: ""
    })
    return <UserContext.Provider value={{ UserName: UserDetails.UserName, id: UserDetails.id, SetUserDetails }}>
        {children}
    </UserContext.Provider>
}

export default  UserContext ; 