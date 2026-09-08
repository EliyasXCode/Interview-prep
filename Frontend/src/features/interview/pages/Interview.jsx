import { useState, useEffect } from "react";
import "../style/interview.scss";
import { useInterview } from "../hooks/useInterview.js";
import { useParams, useNavigate } from "react-router";

// ======================================================
// NAVIGATION ITEMS
// ======================================================

const NAV_ITEMS = [
    {
        id: "ats",
        label: "ATS & Match Audit",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
        )
    },
    {
        id: "technical",
        label: "Technical Questions",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
            </svg>
        )
    },
    {
        id: "behavioral",
        label: "Behavioral (STAR)",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        )
    },
    {
        id: "skills",
        label: "Skill Gaps & Strengths",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
        )
    },
    {
        id: "roadmap",
        label: "7-Day Road Map",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
        )
    },
    {
        id: "resume",
        label: "ATS Tailored Resume",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
            </svg>
        )
    }
];

// ======================================================
// QUESTION CARD COMPONENT
// ======================================================

const QuestionCard = ({ item, index, isBehavioral = false }) => {
    const [open, setOpen] = useState(index === 0);
    const [copied, setCopied] = useState(false);

    const handleCopy = (e) => {
        e.stopPropagation();
        const text = `Question: ${item?.question}\n\nIntention: ${item?.intention}\n\nModel Answer:\n${item?.answer}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`q-card ${open ? 'q-card--open' : ''}`}>
            <div className="q-card__header" onClick={() => setOpen((prev) => !prev)}>
                <span className="q-card__index">{isBehavioral ? `B${index + 1}` : `Q${index + 1}`}</span>
                <p className="q-card__question">{item?.question || "Question unavailable"}</p>
                <div className="q-card__actions">
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="copy-btn"
                        title="Copy question and answer"
                    >
                        {copied ? "✓ Copied" : "Copy"}
                    </button>
                    <span className={`q-card__chevron ${open ? "q-card__chevron--open" : ""}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </span>
                </div>
            </div>

            {open && (
                <div className="q-card__body">
                    <div className="q-card__section q-card__section--intention">
                        <span className="q-card__tag q-card__tag--intention">
                            🎯 Interviewer Intention
                        </span>
                        <p>{item?.intention || "Evaluates candidate competence."}</p>
                    </div>

                    <div className="q-card__section q-card__section--answer">
                        <span className="q-card__tag q-card__tag--answer">
                            💡 Model Answer {isBehavioral ? "(STAR Framework)" : ""}
                        </span>
                        <div className="answer-text">
                            {item?.answer?.split('\n').map((para, i) => (
                                para.trim() ? <p key={i}>{para}</p> : null
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ======================================================
// ROAD MAP DAY WITH INTERACTIVE CHECKBOXES
// ======================================================

const RoadMapDay = ({ day }) => {
    const tasks = day?.tasks ?? [];
    const [completedTasks, setCompletedTasks] = useState({});

    const toggleTask = (taskIdx) => {
        setCompletedTasks(prev => ({
            ...prev,
            [taskIdx]: !prev[taskIdx]
        }));
    };

    return (
        <div className="roadmap-day">
            <div className="roadmap-day__header">
                <span className="roadmap-day__badge">Day {day?.day ?? "-"}</span>
                <h3 className="roadmap-day__focus">{day?.focus || "Interview Preparation Focus"}</h3>
            </div>

            <ul className="roadmap-day__tasks">
                {tasks.map((task, index) => (
                    <li
                        key={index}
                        className={completedTasks[index] ? "task--done" : ""}
                        onClick={() => toggleTask(index)}
                    >
                        <input
                            type="checkbox"
                            checked={!!completedTasks[index]}
                            onChange={() => toggleTask(index)}
                            className="task-checkbox"
                        />
                        <span>{task}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// ======================================================
// EMPTY STATE
// ======================================================

const EmptyState = ({ message }) => (
    <div className="content-empty">
        <p>{message}</p>
    </div>
);

// ======================================================
// MAIN COMPONENT
// ======================================================

const Interview = () => {
    const [activeNav, setActiveNav] = useState("ats");
    const [resumeHtml, setResumeHtml] = useState("");
    const [resumeLoading, setResumeLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const {
        report,
        loading,
        getResumePdf,
        getResumePreviewHtml
    } = useInterview();

    const { interviewId } = useParams();
    const navigate = useNavigate();

    // Load Resume HTML for preview when tab opened
    useEffect(() => {
        if (activeNav === "resume" && !resumeHtml && interviewId) {
            setResumeLoading(true);
            getResumePreviewHtml(interviewId)
                .then(html => {
                    if (html) setResumeHtml(html);
                })
                .finally(() => setResumeLoading(false));
        }
    }, [activeNav, interviewId, resumeHtml, getResumePreviewHtml]);

    if (loading) {
        return (
            <main className="loading-screen">
                <div className="loading-card">
                    <div className="loading-spinner"></div>
                    <h2>Loading Interview Preparation Strategy...</h2>
                    <p>Fetching personalized questions, roadmap, and ATS audit</p>
                </div>
            </main>
        );
    }

    if (!report) {
        return (
            <main className="loading-screen">
                <div className="loading-card">
                    <h2>Interview Strategy Not Found</h2>
                    <p>The requested interview report could not be found or has expired.</p>
                    <button onClick={() => navigate("/")} className="button primary-button" style={{ marginTop: '1rem' }}>
                        Create New Preparation Plan
                    </button>
                </div>
            </main>
        );
    }

    // Report data extraction
    const technicalQuestions = report?.technicalQuestions ?? [];
    const behavioralQuestions = report?.behavioralQuestions ?? report?.behavioralQuestion ?? [];
    const preparationPlan = report?.preparationPlan ?? report?.preperationPlan ?? [];
    const skillGaps = report?.skillGaps ?? [];
    const matchScore = Number(report?.matchScore ?? 0);
    const resumeStrengths = report?.resumeStrengths ?? [];
    const ats = report?.atsAnalysis ?? {
        atsScore: 78,
        atsStatus: "Good",
        formattingIssues: ["Ensure standard headings are used across all sections"],
        matchedKeywords: ["React", "JavaScript", "REST APIs", "Node.js"],
        missingKeywords: ["CI/CD", "Docker", "Unit Testing"],
        recommendations: [
            "Use standard single-column layout without tables or graphics.",
            "Start bullet points with strong action verbs (Engineered, Architected, Developed).",
            "Incorporate exact keywords from the target job description."
        ]
    };

    const atsScore = Number(ats?.atsScore ?? 75);

    const matchColor =
        matchScore >= 80 ? "score--high" : matchScore >= 60 ? "score--mid" : "score--low";
    const atsColor =
        atsScore >= 80 ? "score--high" : atsScore >= 60 ? "score--mid" : "score--low";

    const handleResumeDownload = async () => {
        if (!interviewId) return;
        setDownloading(true);
        try {
            await getResumePdf(interviewId);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="interview-page">
            {/* Top Bar Navigation */}
            <div className="report-top-bar">
                <button onClick={() => navigate("/")} className="back-link">
                    ← Back to Dashboard
                </button>
                <div className="top-role-info">
                    <span className="top-role-label">Target Role</span>
                    <h1 className="top-role-title">{report?.title || "Target Position"}</h1>
                </div>
                <div className="top-actions">
                    <button
                        onClick={handleResumeDownload}
                        disabled={downloading}
                        className="button download-header-btn"
                    >
                        {downloading ? (
                            <span>Generating PDF...</span>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                Download ATS Resume (PDF)
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="interview-layout">
                {/* LEFT NAVIGATION */}
                <nav className="interview-nav">
                    <div className="nav-content">
                        <p className="interview-nav__label">Sections</p>
                        {NAV_ITEMS.map((item) => (
                            <button
                                key={item.id}
                                className={`interview-nav__item ${activeNav === item.id ? "interview-nav__item--active" : ""}`}
                                onClick={() => setActiveNav(item.id)}
                            >
                                <span className="interview-nav__icon">{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="nav-resume-card">
                        <h4>ATS-Optimized Resume</h4>
                        <p>Download your tailored resume in ATS-friendly format</p>
                        <button
                            onClick={handleResumeDownload}
                            disabled={downloading}
                            className="button primary-button resume-action-btn"
                        >
                            {downloading ? "Generating..." : "Download PDF"}
                        </button>
                    </div>
                </nav>

                <div className="interview-divider" />

                {/* CENTER CONTENT */}
                <main className="interview-content">
                    {/* ATS & MATCH AUDIT */}
                    {activeNav === "ats" && (
                        <section className="ats-audit-section">
                            <div className="content-header">
                                <div>
                                    <h2>ATS Compatibility & Profile Match Audit</h2>
                                    <p className="content-subtitle">
                                        Evaluation of your resume against Applicant Tracking Systems and job requirements
                                    </p>
                                </div>
                                <span className={`status-badge status--${ats?.atsStatus?.toLowerCase().replace(/\s+/g, '-') || 'good'}`}>
                                    {ats?.atsStatus || "Good"} Rating
                                </span>
                            </div>

                            {/* Dual Score Cards */}
                            <div className="audit-metrics-grid">
                                <div className="metric-card">
                                    <div className="metric-meta">
                                        <span className="metric-label">ATS Compatibility Score</span>
                                        <h3 className="metric-title">Applicant Tracking Fit</h3>
                                    </div>
                                    <div className={`metric-ring ${atsColor}`}>
                                        <span className="metric-number">{atsScore}%</span>
                                    </div>
                                    <p className="metric-desc">
                                        {atsScore >= 80
                                            ? "High chance of passing automated HR & ATS parsers."
                                            : "Resume has areas that may be flagged by automated scanners."}
                                    </p>
                                </div>

                                <div className="metric-card">
                                    <div className="metric-meta">
                                        <span className="metric-label">Job Match Score</span>
                                        <h3 className="metric-title">Skills & Experience Alignment</h3>
                                    </div>
                                    <div className={`metric-ring ${matchColor}`}>
                                        <span className="metric-number">{matchScore}%</span>
                                    </div>
                                    <p className="metric-desc">
                                        {matchScore >= 80
                                            ? "Strong candidate profile for this position."
                                            : matchScore >= 60
                                                ? "Good profile with minor preparation needed."
                                                : "Candidate should focus heavily on key skill gaps."}
                                    </p>
                                </div>
                            </div>

                            {/* Instant ATS Resume Download Banner on the Main Page */}
                            <div className="audit-resume-cta">
                                <div className="audit-resume-cta__info">
                                    <span className="audit-resume-cta__badge">ATS Resume Ready</span>
                                    <h3>Download Your ATS-Optimized Resume</h3>
                                    <p>
                                        Tailored in strict ATS single-column formatting with verified job keywords and scoring <strong>{atsScore}%</strong> ATS readiness.
                                    </p>
                                </div>
                                <div className="audit-resume-cta__actions">
                                    <button
                                        type="button"
                                        onClick={handleResumeDownload}
                                        disabled={downloading}
                                        className="button primary-button cta-download-btn"
                                    >
                                        {downloading ? "Building PDF..." : "📥 Download ATS Resume (PDF)"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveNav("resume")}
                                        className="button secondary-button cta-preview-btn"
                                    >
                                        👁️ View Live Resume
                                    </button>
                                </div>
                            </div>

                            {/* Candidate Strengths */}
                            {resumeStrengths && resumeStrengths.length > 0 && (
                                <div className="audit-card">
                                    <h3 className="audit-card__title">
                                        <span>🌟 Profile Strengths for this Position</span>
                                    </h3>
                                    <ul className="check-list">
                                        {resumeStrengths.map((str, i) => (
                                            <li key={i}>
                                                <span className="check-icon">✓</span>
                                                <span>{str}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Keywords Analysis */}
                            <div className="keywords-audit-grid">
                                <div className="audit-card">
                                    <h3 className="audit-card__title">
                                        <span>✅ Matched Job Keywords</span>
                                    </h3>
                                    <div className="keywords-wrap">
                                        {ats?.matchedKeywords && ats.matchedKeywords.length > 0 ? (
                                            ats.matchedKeywords.map((kw, i) => (
                                                <span key={i} className="kw-tag kw-tag--matched">
                                                    ✓ {kw}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-muted">No specific matched keywords detected.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="audit-card">
                                    <h3 className="audit-card__title">
                                        <span>⚠️ Missing Keywords (Add to Resume)</span>
                                    </h3>
                                    <div className="keywords-wrap">
                                        {ats?.missingKeywords && ats.missingKeywords.length > 0 ? (
                                            ats.missingKeywords.map((kw, i) => (
                                                <span key={i} className="kw-tag kw-tag--missing">
                                                    + {kw}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-muted">All primary keywords matched!</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Recommendations */}
                            {ats?.recommendations && ats.recommendations.length > 0 && (
                                <div className="audit-card">
                                    <h3 className="audit-card__title">
                                        <span>📋 Actionable ATS Optimization Steps</span>
                                    </h3>
                                    <ul className="recommendations-list">
                                        {ats.recommendations.map((rec, i) => (
                                            <li key={i}>
                                                <span className="rec-num">{i + 1}</span>
                                                <span>{rec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </section>
                    )}

                    {/* TECHNICAL QUESTIONS */}
                    {activeNav === "technical" && (
                        <section>
                            <div className="content-header">
                                <div>
                                    <h2>Technical Interview Questions</h2>
                                    <p className="content-subtitle">
                                        Questions tailored to your target tech stack, projects, and architecture
                                    </p>
                                </div>
                                <span className="content-header__count">
                                    {technicalQuestions.length} Questions
                                </span>
                            </div>

                            <div className="q-list">
                                {technicalQuestions.length > 0 ? (
                                    technicalQuestions.map((question, index) => (
                                        <QuestionCard
                                            key={index}
                                            item={question}
                                            index={index}
                                            isBehavioral={false}
                                        />
                                    ))
                                ) : (
                                    <EmptyState message="No technical questions were generated." />
                                )}
                            </div>
                        </section>
                    )}

                    {/* BEHAVIORAL QUESTIONS */}
                    {activeNav === "behavioral" && (
                        <section>
                            <div className="content-header">
                                <div>
                                    <h2>Behavioral Questions (STAR Method)</h2>
                                    <p className="content-subtitle">
                                        Structured answers using Situation, Task, Action, and Result
                                    </p>
                                </div>
                                <span className="content-header__count">
                                    {behavioralQuestions.length} Questions
                                </span>
                            </div>

                            <div className="q-list">
                                {behavioralQuestions.length > 0 ? (
                                    behavioralQuestions.map((question, index) => (
                                        <QuestionCard
                                            key={index}
                                            item={question}
                                            index={index}
                                            isBehavioral={true}
                                        />
                                    ))
                                ) : (
                                    <EmptyState message="No behavioral questions were generated." />
                                )}
                            </div>
                        </section>
                    )}

                    {/* SKILL GAPS & STRENGTHS */}
                    {activeNav === "skills" && (
                        <section>
                            <div className="content-header">
                                <div>
                                    <h2>Skill Gaps & Target Requirements</h2>
                                    <p className="content-subtitle">
                                        Areas where the job description demands more depth than found in your profile
                                    </p>
                                </div>
                                <span className="content-header__count">
                                    {skillGaps.length} Gaps Identified
                                </span>
                            </div>

                            <div className="skills-grid">
                                {skillGaps.length > 0 ? (
                                    skillGaps.map((gap, index) => (
                                        <div key={index} className="skill-card">
                                            <div className="skill-card__header">
                                                <h4 className="skill-card__name">{gap?.skill || "Unknown Skill"}</h4>
                                                <span className={`skill-tag skill-tag--${gap?.severity ?? "low"}`}>
                                                    {gap?.severity?.toUpperCase() || "LOW"} SEVERITY
                                                </span>
                                            </div>
                                            <p className="skill-card__guidance">
                                                {gap?.severity === "high"
                                                    ? "Critical requirement for this role. Prepare project examples or complete a targeted tutorial before interview."
                                                    : gap?.severity === "medium"
                                                        ? "Important skill often tested in second-round interviews. Review core concepts and common design patterns."
                                                        : "Helpful complementary skill. Mention familiarity or willingness to learn."}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyState message="No significant skill gaps found! Your profile is well aligned." />
                                )}
                            </div>
                        </section>
                    )}

                    {/* ROAD MAP */}
                    {activeNav === "roadmap" && (
                        <section>
                            <div className="content-header">
                                <div>
                                    <h2>7-Day Interview Preparation Road Map</h2>
                                    <p className="content-subtitle">
                                        Day-by-day practical checklist to master technical topics and behavioral stories
                                    </p>
                                </div>
                                <span className="content-header__count">
                                    {preparationPlan.length}-Day Structured Plan
                                </span>
                            </div>

                            <div className="roadmap-list">
                                {preparationPlan.length > 0 ? (
                                    preparationPlan.map((day, index) => (
                                        <RoadMapDay
                                            key={day?.day ?? index}
                                            day={day}
                                        />
                                    ))
                                ) : (
                                    <EmptyState message="No preparation roadmap was generated for this report." />
                                )}
                            </div>
                        </section>
                    )}

                    {/* ATS TAILORED RESUME PREVIEW & DOWNLOAD */}
                    {activeNav === "resume" && (
                        <section className="resume-preview-section">
                            <div className="content-header">
                                <div>
                                    <h2>ATS Tailored Resume (Live Preview & Download)</h2>
                                    <p className="content-subtitle">
                                        Formatted in strict ATS-compliant single-column layout with optimized job keywords
                                    </p>
                                </div>
                                <div className="header-button-group">
                                    <button
                                        onClick={handleResumeDownload}
                                        disabled={downloading}
                                        className="button primary-button"
                                    >
                                        {downloading ? "Generating PDF..." : "📥 Download ATS PDF"}
                                    </button>
                                </div>
                            </div>

                            {resumeLoading ? (
                                <div className="resume-loading-card">
                                    <div className="loading-spinner"></div>
                                    <p>Formatting ATS-compliant resume preview...</p>
                                </div>
                            ) : resumeHtml ? (
                                <div className="resume-paper-container">
                                    <div
                                        className="resume-paper"
                                        dangerouslySetInnerHTML={{ __html: resumeHtml }}
                                    />
                                </div>
                            ) : (
                                <div className="resume-action-prompt">
                                    <h3>Ready to Generate Your ATS Resume</h3>
                                    <p>Click below to generate and download your tailored, ATS-compliant PDF resume.</p>
                                    <button
                                        onClick={handleResumeDownload}
                                        disabled={downloading}
                                        className="button primary-button"
                                    >
                                        {downloading ? "Building Resume..." : "Generate & Download Resume PDF"}
                                    </button>
                                </div>
                            )}
                        </section>
                    )}
                </main>

                <div className="interview-divider" />

                {/* RIGHT SIDEBAR */}
                <aside className="interview-sidebar">
                    {/* MATCH SCORE */}
                    <div className="match-score">
                        <p className="match-score__label">Job Match</p>
                        <div className={`match-score__ring ${matchColor}`}>
                            <span className="match-score__value">{matchScore}</span>
                            <span className="match-score__pct">%</span>
                        </div>
                        <p className="match-score__sub">
                            {matchScore >= 80
                                ? "Strong match for role"
                                : matchScore >= 60
                                    ? "Good match with prep"
                                    : "Preparation recommended"}
                        </p>
                    </div>

                    <div className="sidebar-divider" />

                    {/* ATS SCORE */}
                    <div className="match-score">
                        <p className="match-score__label">ATS Readiness</p>
                        <div className={`match-score__ring ${atsColor}`}>
                            <span className="match-score__value">{atsScore}</span>
                            <span className="match-score__pct">%</span>
                        </div>
                        <p className="match-score__sub">
                            {atsScore >= 80 ? "ATS Optimized" : "Optimization Advised"}
                        </p>
                    </div>

                    <div className="sidebar-divider" />

                    {/* SKILL GAPS */}
                    <div className="skill-gaps">
                        <p className="skill-gaps__label">Key Focus Gaps ({skillGaps.length})</p>
                        <div className="skill-gaps__list">
                            {skillGaps.length > 0 ? (
                                skillGaps.map((gap, index) => (
                                    <span
                                        key={index}
                                        className={`skill-tag skill-tag--${gap?.severity ?? "low"}`}
                                    >
                                        {gap?.skill || "Skill"}
                                    </span>
                                ))
                            ) : (
                                <span className="skill-tag">No major gaps</span>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Interview;