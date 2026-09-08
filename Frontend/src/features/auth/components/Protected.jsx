import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

const Protected = ({ children }) => {
    const { loading, user } = useAuth();
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token && !user) {
        return <Navigate to="/login" replace />;
    }

    if (loading && !user) {
        return (
            <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0a0d14", color: "#f1f5f9" }}>
                <div style={{ width: "40px", height: "40px", border: "3px solid rgba(255,255,255,0.1)", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: "1rem" }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>Verifying session...</p>
            </main>
        );
    }

    if (!user) {
        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
        }
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default Protected;