const mongoose = require("mongoose");


// ======================================================
// TECHNICAL QUESTION SCHEMA
// ======================================================

const technicalQuestionSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: [true, "Technical question is required"]
        },

        intention: {
            type: String,
            required: [true, "Intention is required"]
        },

        answer: {
            type: String,
            required: [true, "Answer is required"]
        }
    },
    {
        _id: false
    }
);


// ======================================================
// BEHAVIORAL QUESTION SCHEMA
// ======================================================

const behavioralQuestionSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: [true, "Behavioral question is required"]
        },

        intention: {
            type: String,
            required: [true, "Intention is required"]
        },

        answer: {
            type: String,
            required: [true, "Answer is required"]
        }
    },
    {
        _id: false
    }
);


// ======================================================
// SKILL GAP SCHEMA
// ======================================================

const skillGapSchema = new mongoose.Schema(
    {
        skill: {
            type: String,
            required: [true, "Skill is required"]
        },

        severity: {
            type: String,
            enum: [
                "low",
                "medium",
                "high"
            ],
            required: [true, "Severity is required"]
        }
    },
    {
        _id: false
    }
);


// ======================================================
// PREPARATION PLAN SCHEMA
// ======================================================

const preparationPlanSchema = new mongoose.Schema(
    {
        day: {
            type: Number,
            required: [true, "Day is required"]
        },

        focus: {
            type: String,
            required: [true, "Focus is required"]
        },

        tasks: [
            {
                type: String,
                required: [true, "Task is required"]
            }
        ]
    },
    {
        _id: false
    }
);


// ======================================================
// INTERVIEW REPORT SCHEMA
// ======================================================

const interviewReportSchema = new mongoose.Schema(
    {
        jobDescription: {
            type: String,
            required: [true, "Job description is required"]
        },

        resume: {
            type: String
        },

        selfDescription: {
            type: String
        },

        matchScore: {
            type: Number,
            min: 0,
            max: 100
        },


        // ✅ Correct
        technicalQuestions: [
            technicalQuestionSchema
        ],


        // ✅ FIXED: behavioralQuestion → behavioralQuestions
        behavioralQuestions: [
            behavioralQuestionSchema
        ],


        skillGaps: [
            skillGapSchema
        ],


        // ✅ FIXED: preperationPlan → preparationPlan
        preparationPlan: [
            preparationPlanSchema
        ],


        atsAnalysis: {
            atsScore: { type: Number, min: 0, max: 100, default: 75 },
            atsStatus: { type: String, default: "Good" },
            formattingIssues: [{ type: String }],
            matchedKeywords: [{ type: String }],
            missingKeywords: [{ type: String }],
            recommendations: [{ type: String }]
        },

        resumeStrengths: [{ type: String }],

        tailoredResumeHtml: {
            type: String
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        },

        title: {
            type: String,
            required: [true, "Job title is required"]
        }
    },
    {
        timestamps: true
    }
);


// ======================================================
// MODEL
// ======================================================

const interviewReportModel = mongoose.model(
    "InterviewReport",
    interviewReportSchema
);


module.exports = interviewReportModel;