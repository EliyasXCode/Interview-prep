const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
let puppeteer;
try {
    puppeteer = require("puppeteer");
} catch (e) {
    // Puppeteer not installed or not available in current environment
}


const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

const MODEL_NAME = "gemini-3-flash-preview";

async function callGeminiWithRetry(params, maxRetries = 4) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await ai.models.generateContent(params);
        } catch (err) {
            const isTransient =
                err.status === 503 ||
                err.status === 429 ||
                err.status === 500 ||
                (err.message && (
                    err.message.includes("overloaded") ||
                    err.message.includes("UNAVAILABLE") ||
                    err.message.includes("temporarily unavailable") ||
                    err.message.includes("rate limit")
                ));

            console.warn(`Gemini attempt ${attempt}/${maxRetries} error: ${err.status || ''} ${err.message || ''}`);

            if (isTransient && attempt < maxRetries) {
                const delay = attempt * 2000;
                console.warn(`Retrying Gemini request in ${delay}ms...`);
                await new Promise((res) => setTimeout(res, delay));
                continue;
            }

            throw err;
        }
    }
}


// ======================================================
// INTERVIEW REPORT SCHEMA
// ======================================================

const interviewReportSchema = z.object({

    // --------------------------------------------------
    // MATCH SCORE
    // --------------------------------------------------

    matchScore: z
        .number()
        .min(0)
        .max(100)
        .describe(
            "A score between 0 and 100 indicating how well the candidate's profile matches the job description"
        ),

    atsAnalysis: z.object({
        atsScore: z.number().min(0).max(100).describe("ATS compatibility score 0-100 evaluating standard headers, keyword match, readability, and formatting"),
        atsStatus: z.enum(["Excellent", "Good", "Needs Improvement", "Critical Issues"]).describe("Overall ATS compliance rating"),
        formattingIssues: z.array(z.string()).describe("List of potential ATS parser issues detected in the resume"),
        matchedKeywords: z.array(z.string()).describe("Important skills, technologies, and terms from the job description found in the resume"),
        missingKeywords: z.array(z.string()).describe("Crucial skills and keywords from the job description that are missing in the resume"),
        recommendations: z.array(z.string()).describe("Concrete, actionable steps to optimize the resume for ATS automated screening filters")
    }).describe("Comprehensive ATS audit and compatibility breakdown"),

    resumeStrengths: z.array(z.string()).describe("Top 3 to 5 strengths of the candidate's profile matching this specific job"),


    // --------------------------------------------------
    // TECHNICAL QUESTIONS
    // --------------------------------------------------

    technicalQuestions: z
        .array(
            z.object({

                question: z.string().describe(
                    "A technical interview question relevant to the candidate's resume and target job"
                ),

                intention: z.string().describe(
                    "What the interviewer wants to evaluate by asking this technical question"
                ),

                answer: z.string().describe(
                    "Concise, high-impact model answer with key concepts (2-3 concise paragraphs)"
                )

            })
        )
        .min(3)
        .max(4)
        .describe(
            "Generate exactly 4 high-impact technical interview questions"
        ),


    // --------------------------------------------------
    // BEHAVIORAL QUESTIONS
    // --------------------------------------------------

    behavioralQuestions: z
        .array(
            z.object({

                question: z.string().describe(
                    "A behavioral interview question relevant to the candidate and target position"
                ),

                intention: z.string().describe(
                    "What behavioral quality the interviewer wants to evaluate"
                ),

                answer: z.string().describe(
                    "Concise STAR method response (Situation, Task, Action, Result)"
                )

            })
        )
        .min(3)
        .max(3)
        .describe(
            "Generate exactly 3 core behavioral interview questions covering teamwork, problem solving, and ownership"
        ),


    // --------------------------------------------------
    // SKILL GAPS
    // --------------------------------------------------

    skillGaps: z
        .array(
            z.object({

                skill: z.string().describe(
                    "A skill required by the target job that the candidate lacks or has insufficient evidence of"
                ),

                severity: z
                    .enum([
                        "low",
                        "medium",
                        "high"
                    ])
                    .describe(
                        "How important this skill gap is for the target job"
                    )

            })
        )
        .describe(
            "Important skill gaps between the candidate profile and the job requirements"
        ),


    // --------------------------------------------------
    // PREPARATION PLAN
    // --------------------------------------------------

    preparationPlan: z
        .array(
            z.object({

                day: z.number().describe(
                    "The preparation day number starting from 1"
                ),

                focus: z.string().describe(
                    "The primary interview preparation focus for this day"
                ),

                tasks: z
                    .array(
                        z.string()
                    )
                    .min(3)
                    .describe(
                        "At least 3 practical tasks that the candidate should complete on this day"
                    )

            })
        )
        .min(7)
        .max(7)
        .describe(
            "Exactly 7 days of interview preparation"
        ),


    // --------------------------------------------------
    // JOB TITLE
    // --------------------------------------------------

    title: z.string().describe(
        "The title of the target job from the job description"
    )

});


// ======================================================
// GENERATE INTERVIEW REPORT
// ======================================================

async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription
}) {

    try {

        const prompt = `
Generate a detailed interview preparation report for the following candidate.

==================================================
CANDIDATE RESUME
==================================================

${resume}


==================================================
SELF DESCRIPTION
==================================================

${selfDescription}


==================================================
TARGET JOB DESCRIPTION
==================================================

${jobDescription}


==================================================
IMPORTANT INSTRUCTIONS
==================================================

Analyze the candidate's resume, self description and target job description.

Generate the report according to the provided structured output schema.

1. MATCH SCORE

Generate a realistic match score between 0 and 100.

Evaluate:

- Candidate's technical skills
- Relevant projects
- Professional experience
- Technologies required by the job
- Database knowledge
- Cloud / DevOps knowledge
- Communication and collaboration requirements


2. ATS ANALYSIS & RESUME AUDIT

Analyze the candidate's resume for Applicant Tracking System (ATS) compatibility:
- Calculate an ATS Score (0-100) based on readability, keyword density, section headers, and formatting.
- Determine ATS status: 'Excellent' (85-100), 'Good' (70-84), 'Needs Improvement' (50-69), or 'Critical Issues' (<50).
- Identify any formatting risks (e.g. non-standard section titles, missing email/phone, tables or graphics if any).
- Identify matched keywords (skills/tech from job description present in resume).
- Identify missing critical keywords from the job description that the resume should include.
- Provide clear, actionable recommendations to improve the resume for ATS parsing.
- Provide 3 to 5 candidate key strengths matching this job.


3. TECHNICAL QUESTIONS

Generate between 4 and 6 technical interview questions.

The questions should be based specifically on:

- Candidate's listed skills
- Candidate's projects
- Technologies mentioned in the job description
- Frontend concepts
- Backend concepts
- REST APIs
- Authentication
- Databases
- JavaScript / TypeScript
- React
- Node.js / Express
- System design where appropriate
- Cloud / deployment where appropriate

Every technical question MUST contain:

- question
- intention
- answer


3. BEHAVIORAL QUESTIONS

Generate between 4 and 6 behavioral interview questions.

IMPORTANT:
DO NOT return an empty behavioralQuestions array.

Questions should cover topics such as:

- Teamwork
- Communication
- Conflict resolution
- Working under deadlines
- Taking ownership
- Solving difficult problems
- Learning from mistakes
- Handling failures
- Working with team members
- Receiving feedback
- Leadership where relevant

Every behavioral question MUST contain:

- question
- intention
- answer

The recommended answer should explain how the candidate can structure
their response.

Use the STAR method when appropriate:

Situation
Task
Action
Result


4. SKILL GAPS

Compare the candidate's existing skills with the target job requirements.

Identify skills that:

- Are completely missing
- Are mentioned weakly
- Need more preparation

Each skill gap should include:

- skill
- severity

Severity must be:

low
medium
or
high


5. PREPARATION PLAN

Generate EXACTLY 7 preparation days.

IMPORTANT:
DO NOT return an empty preparationPlan array.

Each day MUST contain:

- day
- focus
- at least 3 tasks

Create a realistic progression.

For example:

Day 1:
Core technical fundamentals

Day 2:
Job-specific frontend/backend technologies

Day 3:
Database and API preparation

Day 4:
Projects and architecture explanation

Day 5:
System design / scalability / deployment

Day 6:
Behavioral interview preparation

Day 7:
Mock interview and final revision

Adapt the actual preparation topics according to the candidate's resume
and target job.


6. JOB TITLE

Use the target position from the job description as the report title.


==================================================
IMPORTANT ACCURACY RULES
==================================================

Do NOT invent:

- Companies
- Work experience
- Education
- Certifications
- Projects
- Technologies
- Achievements

that are not supported by the candidate's information.

You may recommend learning missing technologies,
but do not claim that the candidate already has experience with them.
`;


        // Convert Zod schema to JSON Schema
        const jsonSchema =
            z.toJSONSchema(interviewReportSchema);


        const response =
            await callGeminiWithRetry({

                model: MODEL_NAME,

                contents: prompt,

                config: {

                    responseMimeType:
                        "application/json",

                    responseJsonSchema:
                        jsonSchema,

                    temperature: 0.2

                }

            });


        if (!response?.text) {

            throw new Error(
                "Gemini returned an empty response"
            );

        }


        const parsedResponse =
            JSON.parse(response.text);


        // Validate Gemini response
        const report =
            interviewReportSchema.parse(
                parsedResponse
            );


        console.log(
            "Generated Interview Report:"
        );

        console.dir(
            report,
            {
                depth: null
            }
        );


        return report;


    } catch (error) {

        console.error(
            "GENERATE INTERVIEW REPORT ERROR:",
            error
        );

        throw error;

    }

}


// ======================================================
// GENERATE PDF FROM HTML
async function generatePdfFromHtml(htmlContent) {

    let browser;

    try {
        if (!puppeteer) {
            try {
                puppeteer = require("puppeteer");
            } catch (e) {
                throw new Error("Puppeteer is not available in this environment. Falling back to browser print.");
            }
        }

        browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });

        const page = await browser.newPage();

        // Enforce strict single-page print stylesheet
        const singlePageCss = `
        <style>
        @page {
            size: A4 portrait;
            margin: 6mm 10mm 6mm 10mm;
        }
        *, *:before, *:after {
            box-sizing: border-box !important;
        }
        html, body {
            margin: 0 !important;
            padding: 0 !important;
            font-family: Arial, Helvetica, sans-serif !important;
            font-size: 8.8pt !important;
            line-height: 1.25 !important;
            color: #111827 !important;
            background: #ffffff !important;
            width: 100% !important;
        }
        h1 {
            font-size: 15pt !important;
            margin: 0 0 2px 0 !important;
            text-align: center !important;
            font-weight: bold !important;
        }
        .contact, header p, .header p, .contact-info {
            font-size: 8.2pt !important;
            margin: 1px 0 4px 0 !important;
            text-align: center !important;
        }
        h2 {
            font-size: 10pt !important;
            text-transform: uppercase !important;
            border-bottom: 1px solid #1f2937 !important;
            margin: 5px 0 2px 0 !important;
            padding-bottom: 1px !important;
            font-weight: bold !important;
        }
        h3 {
            font-size: 9pt !important;
            margin: 2px 0 1px 0 !important;
            font-weight: 600 !important;
        }
        p {
            margin: 1.5px 0 !important;
            font-size: 8.8pt !important;
            line-height: 1.25 !important;
        }
        ul {
            margin: 1.5px 0 3px 14px !important;
            padding: 0 !important;
        }
        li {
            margin: 1px 0 !important;
            font-size: 8.8pt !important;
            line-height: 1.24 !important;
        }
        table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin: 1.5px 0 !important;
        }
        td {
            padding: 1px 3px !important;
            font-size: 8.8pt !important;
            vertical-align: top !important;
        }
        hr {
            margin: 3px 0 !important;
            border: none !important;
            border-top: 1px solid #cbd5e1 !important;
        }
        section, div {
            page-break-inside: avoid !important;
        }
        </style>
        `;

        const finalHtml = htmlContent.includes("</head>")
            ? htmlContent.replace("</head>", `${singlePageCss}</head>`)
            : `${singlePageCss}${htmlContent}`;

        await page.setContent(
            finalHtml,
            {
                waitUntil: "domcontentloaded"
            }
        );

        const pdfBuffer =
            await page.pdf({
                format: "A4",
                printBackground: true,
                preferCSSPageSize: true,
                margin: {
                    top: "6mm",
                    right: "10mm",
                    bottom: "6mm",
                    left: "10mm"
                }
            });

        return pdfBuffer;


    } catch (error) {

        console.error(
            "GENERATE PDF ERROR:",
            error
        );

        throw error;


    } finally {

        if (browser) {

            await browser.close();

        }

    }

}


// ======================================================
// RESUME PDF SCHEMA
// ======================================================

const resumePdfSchema = z.object({

    html: z.string().describe(
        "Complete valid HTML document containing the professionally formatted ATS-friendly resume"
    )

});


// ======================================================
// GENERATE RESUME PDF
// ======================================================

async function generateResumePdf({
    resume,
    selfDescription,
    jobDescription
}) {

    try {

        const prompt = `
Generate a professional ATS-friendly resume for this candidate.

==================================================
ORIGINAL RESUME
==================================================

${resume}


==================================================
SELF DESCRIPTION
==================================================

${selfDescription}


==================================================
TARGET JOB DESCRIPTION
==================================================

${jobDescription}


==================================================
REQUIREMENTS
==================================================

Create an improved resume tailored specifically for the target job.

The resume should:

- CRITICAL: MUST STRICTLY FIT ON EXACTLY ONE (1) PAGE. Never allow content to overflow to a second page.
- Keep Professional Summary concise (3-4 impactful sentences maximum).
- Highlight 4-5 relevant skill categories in concise rows.
- For work experience, include 2-3 high-impact bullet points focusing on metrics and results.
- For projects, include 2 concise bullet points per project.
- Match important keywords from the target job description.
- Remain truthful to the candidate's original information.
- Sound naturally written by an experienced professional.
- Be strictly ATS-compliant using a standard single-column top-to-bottom layout.
- Use clean, compact CSS with 8.8pt body font size, 1.25 line-height, and tight spacing so the entire content easily fits on 1 page.
- Avoid complicated multi-column layouts, icons, tables with borders, or graphics that confuse ATS systems.


IMPORTANT:

Do NOT invent:

- Companies
- Work experience
- Projects
- Education
- Certifications
- Skills
- Achievements

that are not present in the candidate's information.


==================================================
RECOMMENDED SECTIONS
==================================================

The resume may contain:

1. Name and Contact Information

2. Professional Summary

3. Technical Skills

4. Work Experience

5. Projects

6. Education

7. Certifications, only if provided


==================================================
HTML REQUIREMENTS
==================================================

Return a complete valid HTML document.

The HTML should contain:

<!DOCTYPE html>
<html>
<head>
...
</head>

<body>
...
</body>
</html>

Use inline or embedded CSS.

Do not use:

- External JavaScript
- External fonts
- External images
- External CSS libraries
- Remote resources

Keep the resume visually professional and easy to convert to PDF.
`;


        const resumeJsonSchema =
            z.toJSONSchema(
                resumePdfSchema
            );


        const response =
            await callGeminiWithRetry({

                model: MODEL_NAME,

                contents: prompt,

                config: {

                    responseMimeType:
                        "application/json",

                    responseJsonSchema:
                        resumeJsonSchema

                }

            });


        if (!response?.text) {

            throw new Error(
                "Gemini returned an empty resume response"
            );

        }


        const parsedResponse =
            JSON.parse(response.text);


        const jsonContent =
            resumePdfSchema.parse(
                parsedResponse
            );


        const pdfBuffer =
            await generatePdfFromHtml(
                jsonContent.html
            );


        return { pdfBuffer, html: jsonContent.html };


    } catch (error) {

        console.error(
            "GENERATE RESUME PDF ERROR:",
            error
        );

        throw error;

    }

}


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
    generateInterviewReport,
    generateResumePdf,
    generatePdfFromHtml
};