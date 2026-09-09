const {generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")
const mongoose = require("mongoose");

/**
 * @description Controller to generate report based on user self description, reume and job description
 */

async function generateInterviewReportController(req, res) {
    try {
        let resumeText = req.body.resumeText || "";

        if (req.file && req.file.buffer) {
            try {
                const pdfModule = require("pdf-parse");
                const PDFParseClass = pdfModule.PDFParse || pdfModule;
                const parser = new PDFParseClass({ data: req.file.buffer });
                const parsed = await parser.getText();
                resumeText = (parsed && parsed.text) ? parsed.text.trim() : "";
                try { await parser.destroy(); } catch (_) {}
                console.log(`Extracted ${resumeText.length} chars from uploaded resume PDF.`);
            } catch (pdfErr) {
                console.warn("PDF parse error/warning:", pdfErr.message);
            }
        }


        const { selfDescription = "", jobDescription } = req.body;

        if (!jobDescription || !jobDescription.trim()) {
            return res.status(400).json({
                message: "Target job description is required."
            });
        }

        if (!resumeText.trim() && !selfDescription.trim()) {
            return res.status(400).json({
                message: "Please provide either a resume (PDF/text) or a self-description."
            });
        }

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        });

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        });

        res.status(201).json({
            message: "Interview report generated successfully",
            interviewReport
        });
    } catch (err) {
        console.error("GENERATE REPORT ERROR:", err);

        let message = "Failed to generate interview strategy. Please try again.";

        const is429 = err.status === 429 || (err.message && (err.message.includes("429") || err.message.includes("quota") || err.message.includes("RESOURCE_EXHAUSTED")));
        const is503 = err.status === 503 || (err.message && err.message.includes("overloaded"));

        if (is429) {
            const match = err.message && err.message.match(/retry in ([\d\.]+)s/i);
            const seconds = match ? Math.ceil(parseFloat(match[1])) : 30;
            message = `Gemini Free-Tier rate limit reached. Please wait ${seconds} seconds before requesting a new report, or view your existing reports below.`;
        } else if (is503) {
            message = "Google Gemini AI is currently experiencing high demand. Please try again in a few moments.";
        } else if (err.message && !err.message.startsWith("{")) {
            message = err.message;
        }

        res.status(500).json({
            message,
            error: err.message
        });
    }
}


/**
 * @description Controller to get interview report by interviewId.
 */

async function getInterviewReportByIdController(req,res){

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id})


    if(!interviewReport){
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })

}

/**
 * @description Controller to get interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res){
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preperationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}

/**
 * @description Controller to generate resume PDF based on user self description, resume and jon description.
 */
async function generateResumePdfController(req, res) {
    try {
        let { interviewReportId } = req.params;

        // Remove accidental spaces
        interviewReportId = interviewReportId?.trim();

        console.log("ID received:", JSON.stringify(interviewReportId));
        console.log("ID length:", interviewReportId?.length);
        console.log(
            "Valid ObjectId:",
            mongoose.Types.ObjectId.isValid(interviewReportId)
        );

        // Validate before querying MongoDB
        if (!mongoose.Types.ObjectId.isValid(interviewReportId)) {
            return res.status(400).json({
                message: "Invalid interview report ID",
                receivedId: interviewReportId
            });
        }

        // Also verify this report belongs to logged-in user
        const interviewReport = await interviewReportModel.findOne({
            _id: interviewReportId,
            user: req.user.id
        });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        const {
            resume,
            jobDescription,
            selfDescription
        } = interviewReport;

        let pdfBuffer;
        if (interviewReport.tailoredResumeHtml && req.query.regenerate !== "true") {
            const { generatePdfFromHtml } = require("../services/ai.service");
            pdfBuffer = await generatePdfFromHtml(interviewReport.tailoredResumeHtml);
        } else {
            const result = await generateResumePdf({
                resume,
                jobDescription,
                selfDescription
            });
            pdfBuffer = result.pdfBuffer;
            interviewReport.tailoredResumeHtml = result.html;
            await interviewReport.save();
        }

        if (!pdfBuffer) {
            return res.status(200).json({
                message: "PDF rendering in serverless environment unavailable; use client print view",
                fallbackToPrint: true,
                html: interviewReport.tailoredResumeHtml
            });
        }

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition":
                `attachment; filename=resume_${interviewReportId}.pdf`
        });

        return res.send(Buffer.from(pdfBuffer));

    } catch (error) {
        console.error("GENERATE RESUME PDF ERROR:", error);

        return res.status(500).json({
            message: "Failed to generate resume PDF",
            error: error.message
        });
    }
}

/**
 * @description Controller to get tailored resume HTML for preview
 */
async function previewResumeHtmlController(req, res) {
    try {
        let { interviewReportId } = req.params;
        interviewReportId = interviewReportId?.trim();

        if (!mongoose.Types.ObjectId.isValid(interviewReportId)) {
            return res.status(400).json({
                message: "Invalid interview report ID"
            });
        }

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewReportId,
            user: req.user.id
        });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        if (interviewReport.tailoredResumeHtml) {
            return res.status(200).json({
                html: interviewReport.tailoredResumeHtml
            });
        }

        const { html } = await generateResumePdf({
            resume: interviewReport.resume,
            jobDescription: interviewReport.jobDescription,
            selfDescription: interviewReport.selfDescription
        });

        interviewReport.tailoredResumeHtml = html;
        await interviewReport.save();

        return res.status(200).json({ html });
    } catch (error) {
        console.error("PREVIEW RESUME ERROR:", error);
        return res.status(500).json({
            message: "Failed to generate resume preview",
            error: error.message
        });
    }
}

module.exports = {
    generateInterviewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController,
    previewResumeHtmlController
};