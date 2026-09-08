import { createContext, useState } from "react";

export const AuthContext = createContext({
    user: null,
    setUser: () => {},
    loading: false,
    setLoading: () => {}
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(!!localStorage.getItem("token"));

    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
            {children}
        </AuthContext.Provider>
    );
};