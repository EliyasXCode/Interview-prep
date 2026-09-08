import { useNavigate, Link } from "react-router"
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'

const Login = () => {
    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errorMsg, setErrorMsg] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorMsg("")
        if (!email || !password) {
            setErrorMsg("Please enter your email and password.")
            return
        }

        try {
            const user = await handleLogin({ email, password })
            if (user) {
                // Ensure token is synced and navigate
                navigate('/', { replace: true })
            } else {
                setErrorMsg("Invalid email or password. Please try again.")
            }
        } catch (err) {
            const msg = err?.response?.data?.message || "Invalid email or password. Please try again."
            setErrorMsg(msg)
        }
    }

    const fillDemo = () => {
        setEmail("demo_candidate@example.com")
        setPassword("Pass123456!")
    }

    if (loading) {
        return (
            <main className="auth-page">
                <div className="form-container" style={{ textAlign: "center", padding: "3rem" }}>
                    <div className="loading-spinner" style={{ margin: "0 auto 1rem" }}></div>
                    <h2>Logging in...</h2>
                </div>
            </main>
        )
    }

    return (
        <main className="auth-page">
            <div className="form-container">
                <div className="form-header">
                    <div className="brand-badge-auth">PrepAI PRO</div>
                    <h1>Welcome Back</h1>
                    <p>Log in to access your interview plans, ATS scores, and resume downloads.</p>
                </div>

                {errorMsg && (
                    <div className="auth-error-banner">
                        <span>⚠️ {errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            id="email"
                            name="email"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button type="submit" className="button primary-button auth-submit-btn">
                        Sign In
                    </button>

                    <button
                        type="button"
                        onClick={fillDemo}
                        className="demo-fill-btn"
                    >
                        ⚡ Fill Demo Account
                    </button>
                </form>

                <p className="auth-footer-text">
                    Don't have an account yet? <Link to="/register">Create an account</Link>
                </p>
            </div>
        </main>
    )
}

export default Login