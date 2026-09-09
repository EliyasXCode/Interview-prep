import {
    getAllInterviewReports,
    generateInterviewReport,
    getInterviewReportById,
    generateResumePdf,
    getResumePreview
} from "../services/interview.api";

import { useContext, useEffect } from "react";
import { InterviewContext } from "../interview.context";
import { useParams } from "react-router";


export const useInterview = () => {

    const context = useContext(InterviewContext);
    const { interviewId } = useParams();


    if (!context) {
        throw new Error(
            "useInterview must be used within an InterviewProvider"
        );
    }


    const {
        loading,
        setLoading,
        report,
        setReport,
        reports,
        setReports
    } = context;


    // Generate Interview Report
    const generateReport = async ({
        jobDescription,
        selfDescription,
        resumeFile,
        resumeText
    }) => {

        setLoading(true);

        let response = null;

        try {

            response = await generateInterviewReport({
                jobDescription,
                selfDescription,
                resumeFile,
                resumeText
            });

            setReport(response.interviewReport);

        } catch (error) {
            console.error("Generate report failed:", error);
            throw error;
        } finally {
            setLoading(false);
        }

        return response?.interviewReport;
    };


    // Get Interview Report By ID
    const getReportById = async (interviewId) => {

        setLoading(true);

        let response = null;

        try {

            response =
                await getInterviewReportById(interviewId);

            setReport(response.interviewReport);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

        return response.interviewReport;
    };


    // Get All Interview Reports
    const getReports = async () => {

        setLoading(true);

        let response = null;

        try {

            response =
                await getAllInterviewReports();

            setReports(response.interviewReports);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

        return response.interviewReports;
    };


    // Helper to extract clean styles and body from full HTML document
    const normalizeResumeHtml = (rawHtml) => {
        if (!rawHtml) return { styles: "", bodyHtml: "", fullDocument: "" };
        try {
            const parser = new DOMParser();
            const parsed = parser.parseFromString(rawHtml, "text/html");
            const styleTags = Array.from(parsed.querySelectorAll("style")).map(s => s.outerHTML).join("\n");
            const bodyHtml = parsed.body ? parsed.body.innerHTML : rawHtml;
            const fullDocument = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8" />
                    <title>ATS Tailored Resume</title>
                    <style>
                        @page {
                            size: A4 portrait;
                            margin: 8mm 10mm;
                        }
                        *, *:before, *:after {
                            box-sizing: border-box !important;
                        }
                        body {
                            margin: 0 !important;
                            padding: 16px 20px !important;
                            font-family: Arial, Helvetica, sans-serif !important;
                            color: #111111 !important;
                            background: #ffffff !important;
                            font-size: 9.5pt !important;
                            line-height: 1.35 !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        h1, h2, h3, h4, h5, h6, p, ul, li, span, div, a {
                            color: #111111 !important;
                        }
                        hr {
                            border: none;
                            border-top: 1px solid #d1d5db;
                            margin: 8px 0;
                        }
                    </style>
                    ${styleTags}
                </head>
                <body>
                    ${bodyHtml}
                </body>
                </html>
            `;
            return { styleTags, bodyHtml, fullDocument };
        } catch (e) {
            return { styleTags: "", bodyHtml: rawHtml, fullDocument: rawHtml };
        }
    };

    // Generate / Download ATS Resume in Real PDF Format using html2pdf.js
    const getResumePdf = async (interviewReportId, providedHtml = null) => {
        setLoading(true);

        try {
            // 1. Obtain the tailored resume HTML
            let rawHtml = providedHtml;
            if (!rawHtml) {
                rawHtml = await getResumePreviewHtml(interviewReportId);
            }

            if (!rawHtml) {
                throw new Error("Resume content is not available yet. Please try again.");
            }

            const { styleTags, bodyHtml } = normalizeResumeHtml(rawHtml);

            // 2. Dynamically load html2pdf.js
            const html2pdfModule = await import("html2pdf.js");
            const html2pdf = html2pdfModule.default || html2pdfModule;

            // 3. Create an explicit render container with non-negative coordinates and forced dark text
            const container = document.createElement("div");
            container.id = "ats-pdf-render-canvas";
            container.style.width = "780px";
            container.style.backgroundColor = "#ffffff";
            container.style.color = "#111827";
            container.style.padding = "20px 26px";
            container.style.boxSizing = "border-box";
            container.style.fontFamily = "Arial, Helvetica, sans-serif";
            container.style.position = "absolute";
            container.style.top = "0px";
            container.style.left = "0px";
            container.style.zIndex = "-1";
            container.innerHTML = `
                <style>
                    #ats-pdf-render-canvas, #ats-pdf-render-canvas * {
                        color: #111827 !important;
                        background: transparent !important;
                    }
                    #ats-pdf-render-canvas h1, #ats-pdf-render-canvas h2, #ats-pdf-render-canvas h3 {
                        color: #111827 !important;
                        margin-top: 6px !important;
                        margin-bottom: 4px !important;
                    }
                    #ats-pdf-render-canvas p, #ats-pdf-render-canvas li, #ats-pdf-render-canvas span, #ats-pdf-render-canvas div {
                        color: #111827 !important;
                        line-height: 1.35 !important;
                    }
                    #ats-pdf-render-canvas hr {
                        border: none !important;
                        border-top: 1px solid #9ca3af !important;
                        margin: 6px 0 !important;
                    }
                </style>
                ${styleTags}
                <div style="width: 100%; color: #111827 !important; background: #ffffff !important;">
                    ${bodyHtml}
                </div>
            `;
            document.body.appendChild(container);

            // Wait 150ms for styles to calculate
            await new Promise(r => setTimeout(r, 150));

            const roleName = report?.title ? report.title.replace(/[^a-zA-Z0-9_-]/g, "_") : "Tailored";
            const opt = {
                margin: [6, 6, 6, 6],
                filename: `ATS_Resume_${roleName}.pdf`,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: "#ffffff",
                    scrollY: 0,
                    scrollX: 0
                },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
            };

            await html2pdf().set(opt).from(container).save();

            // Cleanup
            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
            }

        } catch (error) {
            console.error("Resume PDF generation failed:", error);
            // Fallback: trigger native browser print preview
            window.print();
        } finally {
            setLoading(false);
        }
    };

    // Native Browser Print to PDF (Zero popup blocker issues, 100% clean vector text)
    const printResumePdf = (htmlContent) => {
        window.print();
    };




    // Get Tailored Resume HTML Preview
    const getResumePreviewHtml = async (interviewReportId) => {
        try {
            const data = await getResumePreview({ interviewReportId });
            return data.html;
        } catch (error) {
            console.error("Failed to load resume preview", error);
            return null;
        }
    };

    // Automatically load interview report
    useEffect(() => {

        if (interviewId) {

            getReportById(interviewId);

        } else {

            getReports();

        }

    }, [interviewId]);


    return {
        loading,
        report,
        reports,
        generateReport,
        getReportById,
        getReports,
        getResumePdf,
        getResumePreviewHtml,
        printResumePdf
    };

};