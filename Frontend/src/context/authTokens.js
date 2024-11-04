import { createContext, useContext, useState } from "react";

const AuthTokensContext = createContext(null);

export const AuthTokensProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(null);

    return (
        <AuthTokensContext.Provider value={{
            authTokens,
            setAuthTokens 
        }}>
            {children}
        </AuthTokensContext.Provider>
    )
}

export function useAuthTokens() {
    return useContext(AuthTokensContext);
}