import { useContext, useEffect } from "react";
import { useLocation } from "react-router";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";

const defaultAuthState = {
    user: null,
    setUser: () => {},
    loading: false,
    setLoading: () => {}
};

export const useAuth = () => {
    const context = useContext(AuthContext) ?? defaultAuthState;
    const { user, setUser, loading, setLoading } = context;
    
    let pathname = "/";
    try {
        const loc = useLocation();
        pathname = loc.pathname;
    } catch {
        pathname = typeof window !== "undefined" ? window.location.pathname : "/";
    }

    const handleLogin = async ({ email, password }) => {
        setLoading(true);

        try {
            const data = await login({ email, password });
            const nextUser = data?.user ?? null;
            setUser(nextUser);
            return nextUser;
        } catch (err) {
            console.error("Login failed", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true);

        try {
            const data = await register({ username, email, password });
            const nextUser = data?.user ?? null;
            setUser(nextUser);
            return nextUser;
        } catch (err) {
            console.error("Registration failed", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);

        try {
            await logout();
            setUser(null);
            return true;
        } catch (err) {
            console.error("Logout failed", err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const authPages = ["/login", "/register"];

        if (authPages.includes(pathname)) {
            setLoading(false);
            return;
        }

        if (user) {
            setLoading(false);
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        let isMounted = true;

        const getAndSetUser = async () => {
            setLoading(true);

            try {
                const data = await getMe();
                if (!isMounted) return;
                setUser(data?.user ?? null);
            } catch (err) {
                if (!isMounted) return;
                setUser(null);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        getAndSetUser();

        return () => {
            isMounted = false;
        };
    }, [pathname, setLoading, setUser]);

    return { user, loading, handleRegister, handleLogin, handleLogout };
};