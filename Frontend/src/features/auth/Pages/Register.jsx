import { Link, useNavigate } from "react-router"
import { useState } from "react"
import { useAuth } from "../hooks/useAuth"
import "../auth.form.scss"

const Register = () => {
    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errorMsg, setErrorMsg] = useState("")

    const { loading, handleRegister } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorMsg("")
        if (!username || !email || !password) {
            setErrorMsg("Please fill in all fields.")
            return
        }

        try {
            const user = await handleRegister({ username, email, password })
            if (user) {
                navigate("/", { replace: true })
            } else {
                setErrorMsg("Registration failed. Please verify your details.")
            }
        } catch (err) {
            const msg = err?.response?.data?.message || "Registration failed. Email or username might already be in use."
            setErrorMsg(msg)
        }
    }

    const fillSampleRegistration = () => {
        const rand = Math.floor(1000 + Math.random() * 9000)
        setUsername(`Candidate ${rand}`)
        setEmail(`candidate${rand}@example.com`)
        setPassword("Pass123456!")
    }

    if (loading) {
        return (
            <main className="auth-page">
                <div className="form-container" style={{ textAlign: "center", padding: "3rem" }}>
                    <div className="loading-spinner" style={{ margin: "0 auto 1rem" }}></div>
                    <h2>Creating Account...</h2>
                </div>
            </main>
        )
    }

    return (
        <main className="auth-page">
            <div className="form-container">
                <div className="form-header">
                    <div className="brand-badge-auth">PrepAI PRO</div>
                    <h1>Create an Account</h1>
                    <p>Get personalized AI interview prep, ATS analysis, and custom resumes.</p>
                </div>

                {errorMsg && (
                    <div className="auth-error-banner">
                        <span>⚠️ {errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Full Name / Username</label>
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            type="text"
                            id="username"
                            name="username"
                            placeholder="e.g. John Doe"
                            required
                        />
                    </div>

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
                            placeholder="Create a strong password"
                            required
                        />
                    </div>

                    <button type="submit" className="button primary-button auth-submit-btn">
                        Create Account
                    </button>

                    <button
                        type="button"
                        onClick={fillSampleRegistration}
                        className="demo-fill-btn"
                    >
                        ⚡ Fill Sample Candidate Details
                    </button>
                </form>

                <p className="auth-footer-text">
                    Already have an account? <Link to="/login">Sign in here</Link>
                </p>
            </div>
        </main>
    )
}

export default Register