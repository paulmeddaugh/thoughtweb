import { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const userId = user?.id;
    return (
        <UserContext.Provider value={{
            user, 
            userId, 
            setUser,
        }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => useContext(UserContext);