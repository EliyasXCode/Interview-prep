import { useState, useRef } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useAuth } from '../../auth/hooks/useAuth.js'
import { useNavigate } from 'react-router'

const SAMPLE_JOBS = [
    {
        label: "Full Stack MERN Engineer",
        text: "Senior Full Stack Developer (React & Node.js). Requirements: 3+ years experience building responsive web apps with React.js, Express, and MongoDB. Strong proficiency in JavaScript/TypeScript, RESTful APIs, JWT authentication, state management, and modern CSS/SCSS. Familiarity with cloud deployments, Git workflows, and CI/CD."
    },
    {
        label: "Frontend React Specialist",
        text: "Frontend Software Engineer. Requirements: Expert knowledge of React, React Hooks, Next.js, and Modern JavaScript (ES6+). Experience with responsive web design, performance optimization, web accessibility (WCAG), CSS Modules / Tailwind, component testing, and integrating backend REST/GraphQL APIs."
    },
    {
        label: "Backend Node.js & Cloud",
        text: "Backend Node.js Engineer. Requirements: Strong experience in Node.js, Express, MongoDB/PostgreSQL database design, indexing, caching with Redis, system architecture, API security, unit testing, and Docker containerization. Experience integrating Third-Party APIs and LLM/AI services is a plus."
    }
]

const cleanErrorMessage = (rawMsg) => {
    if (!rawMsg) return "Failed to generate report. Please try again.";
    if (typeof rawMsg === "string" && (rawMsg.includes("RESOURCE_EXHAUSTED") || rawMsg.includes("quota"))) {
        const match = rawMsg.match(/retry in ([\d\.]+)s/i);
        const sec = match ? Math.ceil(parseFloat(match[1])) : 30;
        return `Google Gemini Free-Tier rate limit reached. Please wait ${sec} seconds before generating again, or view your saved strategies below.`;
    }
    if (typeof rawMsg === "string" && (rawMsg.includes("overloaded") || rawMsg.includes("UNAVAILABLE"))) {
        return "Google Gemini AI is currently experiencing high demand. Please try again in a moment.";
    }
    return rawMsg;
};

const Home = () => {
    const { loading, generateReport, reports } = useInterview()
    const { user, handleLogout } = useAuth()
    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const [resumeText, setResumeText] = useState("")
    const [resumeMode, setResumeMode] = useState("file") // "file" or "text"
    const [selectedFile, setSelectedFile] = useState(null)
    const [errorMsg, setErrorMsg] = useState("")
    const resumeInputRef = useRef()
    const navigate = useNavigate()

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
            setErrorMsg("")
        }
    }

    const removeSelectedFile = (e) => {
        e.stopPropagation()
        e.preventDefault()
        setSelectedFile(null)
        if (resumeInputRef.current) {
            resumeInputRef.current.value = ""
        }
    }

    const handleGenerateReport = async () => {
        if (!jobDescription.trim()) {
            setErrorMsg("Please provide a target job description.")
            return
        }

        if (!selectedFile && !resumeText.trim() && !selfDescription.trim()) {
            setErrorMsg("Please upload a resume, paste your resume text, or write a self-description.")
            return
        }

        setErrorMsg("")
        try {
            const data = await generateReport({
                jobDescription,
                selfDescription,
                resumeFile: selectedFile,
                resumeText: resumeMode === "text" ? resumeText : ""
            })
            if (data && data._id) {
                navigate(`/interview/${data._id}`)
            }
        } catch (err) {
            const msg = cleanErrorMessage(err?.response?.data?.message || err?.message);
            setErrorMsg(msg);
        }
    }

    if (loading) {
        return (
            <main className='loading-screen'>
                <div className="loading-card">
                    <div className="loading-spinner"></div>
                    <h2>AI is Analyzing Your Profile...</h2>
                    <p className="loading-sub">Generating deep interview questions, ATS compliance audit & tailored resume</p>
                    
                    <div className="loading-steps">
                        <div className="step-item active">
                            <span className="step-dot"></span>
                            <span>Parsing Resume & Job Requirements</span>
                        </div>
                        <div className="step-item active">
                            <span className="step-dot"></span>
                            <span>Calculating Match & ATS Compatibility Score</span>
                        </div>
                        <div className="step-item active">
                            <span className="step-dot"></span>
                            <span>Generating Technical & STAR Behavioral Questions</span>
                        </div>
                        <div className="step-item active">
                            <span className="step-dot"></span>
                            <span>Building 7-Day Roadmap & Tailored ATS Resume</span>
                        </div>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <div className='home-page'>
            {/* Top Navbar */}
            <nav className='top-navbar'>
                <div className='navbar-brand'>
                    <div className='brand-icon'>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6v6l4 2"/></svg>
                    </div>
                    <span className='brand-title'>PrepAI <span className='brand-badge'>PRO</span></span>
                </div>

                <div className='navbar-actions'>
                    {user && (
                        <div className='user-badge'>
                            <span className='user-avatar'>{user.username ? user.username.charAt(0).toUpperCase() : "U"}</span>
                            <span className='username'>{user.username || user.email}</span>
                        </div>
                    )}
                    <button onClick={handleLogout} className='logout-btn' title='Logout'>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Logout
                    </button>
                </div>
            </nav>

            {/* Page Header */}
            <header className='page-header'>
                <h1>Prepare Smarter with <span className='highlight'>AI Interview Coach</span></h1>
                <p>Upload your resume and target job to receive personalized interview questions, ATS optimization, and a 7-day preparation roadmap.</p>
            </header>

            {errorMsg && (
                <div className='alert-banner'>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Main Card */}
            <div className='interview-card'>
                <div className='interview-card__body'>

                    {/* Left Panel - Job Description */}
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            </span>
                            <h2>Target Job Description</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>

                        {/* Quick sample chips */}
                        <div className='sample-chips'>
                            <span className='sample-label'>Quick Fill:</span>
                            {SAMPLE_JOBS.map((job, idx) => (
                                <button
                                    key={idx}
                                    type='button'
                                    className='sample-chip-btn'
                                    onClick={() => setJobDescription(job.text)}
                                >
                                    {job.label}
                                </button>
                            ))}
                        </div>

                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            className='panel__textarea'
                            placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
                            maxLength={5000}
                        />
                        <div className='char-counter'>{jobDescription.length} / 5000 chars</div>
                    </div>

                    {/* Vertical Divider */}
                    <div className='panel-divider' />

                    {/* Right Panel - Profile */}
                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </span>
                            <h2>Your Profile & Resume</h2>
                        </div>

                        {/* Resume Input Mode Toggle */}
                        <div className='mode-toggle'>
                            <button
                                type='button'
                                className={`mode-btn ${resumeMode === 'file' ? 'active' : ''}`}
                                onClick={() => setResumeMode('file')}
                            >
                                Upload PDF
                            </button>
                            <button
                                type='button'
                                className={`mode-btn ${resumeMode === 'text' ? 'active' : ''}`}
                                onClick={() => setResumeMode('text')}
                            >
                                Paste Resume Text
                            </button>
                        </div>

                        {resumeMode === 'file' ? (
                            <div className='upload-section'>
                                <label className='dropzone' htmlFor='resume'>
                                    {selectedFile ? (
                                        <div className='selected-file-view'>
                                            <span className='file-icon'>📄</span>
                                            <div className='file-meta'>
                                                <p className='file-name'>{selectedFile.name}</p>
                                                <p className='file-size'>{(selectedFile.size / 1024).toFixed(1)} KB &bull; PDF</p>
                                            </div>
                                            <button
                                                type='button'
                                                onClick={removeSelectedFile}
                                                className='remove-file-btn'
                                                title='Remove file'
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className='dropzone__icon'>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                                            </span>
                                            <p className='dropzone__title'>Click to upload or drag &amp; drop</p>
                                            <p className='dropzone__subtitle'>PDF (Max 5MB)</p>
                                        </>
                                    )}
                                    <input
                                        ref={resumeInputRef}
                                        onChange={handleFileChange}
                                        hidden
                                        type='file'
                                        id='resume'
                                        name='resume'
                                        accept='.pdf'
                                    />
                                </label>
                            </div>
                        ) : (
                            <div className='resume-text-section'>
                                <textarea
                                    value={resumeText}
                                    onChange={(e) => setResumeText(e.target.value)}
                                    className='panel__textarea panel__textarea--resume'
                                    placeholder='Paste your resume content, projects, and work experience here...'
                                />
                            </div>
                        )}

                        {/* Self-Description */}
                        <div className='self-description'>
                            <label className='section-label' htmlFor='selfDescription'>
                                Quick Self-Description (Optional)
                            </label>
                            <textarea
                                value={selfDescription}
                                onChange={(e) => setSelfDescription(e.target.value)}
                                id='selfDescription'
                                name='selfDescription'
                                className='panel__textarea panel__textarea--short'
                                placeholder="Add any extra details, years of experience, or target seniority..."
                            />
                        </div>

                        {/* Info Box */}
                        <div className='info-box'>
                            <span className='info-box__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#1a1f27" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="#1a1f27" strokeWidth="2" /></svg>
                            </span>
                            <p>Our Gemini 3 Flash AI automatically analyzes ATS compatibility and generates tailored mock questions.</p>
                        </div>
                    </div>
                </div>

                {/* Card Footer */}
                <div className='interview-card__footer'>
                    <span className='footer-info'>
                        ⚡ Powered by Google Gemini 3 Flash Preview &bull; Includes ATS Audit & Resume Download
                    </span>
                    <button
                        onClick={handleGenerateReport}
                        className='generate-btn'
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                        Generate Interview Plan & ATS Resume
                    </button>
                </div>
            </div>

            {/* Recent Reports List */}
            {reports && reports.length > 0 && (
                <section className='recent-reports'>
                    <h2>My Recent Interview Strategies ({reports.length})</h2>
                    <div className='reports-grid'>
                        {reports.map(rep => (
                            <div
                                key={rep._id}
                                className='report-card'
                                onClick={() => navigate(`/interview/${rep._id}`)}
                            >
                                <div className='report-card__header'>
                                    <h3 className='report-title'>{rep.title || 'Target Position'}</h3>
                                    <span className={`match-badge ${rep.matchScore >= 80 ? 'match--high' : rep.matchScore >= 60 ? 'match--mid' : 'match--low'}`}>
                                        {rep.matchScore}% Match
                                    </span>
                                </div>
                                <p className='report-meta'>
                                    📅 {new Date(rep.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                                <div className='report-card__footer'>
                                    <span className='action-link'>Open Strategy & Resume →</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Page Footer */}
            <footer className='page-footer'>
                <span>AI Interview Platform &bull; ATS Tailored Resumes &bull; Gemini 3.6</span>
            </footer>
        </div>
    )
}

export default Home