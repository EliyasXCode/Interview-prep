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

            // 3. Determine capture target: use visible resume-paper if available, else temporary top-level container
            const existingPaper = document.querySelector(".resume-paper");
            let targetElement = null;
            let tempCreated = false;

            if (existingPaper && existingPaper.innerText.trim().length > 50) {
                targetElement = existingPaper;
            } else {
                targetElement = document.createElement("div");
                targetElement.id = "ats-pdf-render-canvas";
                targetElement.style.position = "fixed";
                targetElement.style.top = "0";
                targetElement.style.left = "0";
                targetElement.style.width = "794px"; // Standard A4 width at 96 DPI
                targetElement.style.minHeight = "1123px";
                targetElement.style.backgroundColor = "#ffffff";
                targetElement.style.color = "#111111";
                targetElement.style.padding = "24px 30px";
                targetElement.style.boxSizing = "border-box";
                targetElement.style.fontFamily = "Arial, Helvetica, sans-serif";
                targetElement.style.zIndex = "99999"; // Temporarily in view to ensure html2canvas paints pixels
                targetElement.innerHTML = `
                    <style>
                        *, *:before, *:after { box-sizing: border-box !important; }
                        body, div, p, li, span, h1, h2, h3, h4 { color: #111111 !important; }
                    </style>
                    ${styleTags}
                    <div style="width: 100%; color: #111111; background: #ffffff;">
                        ${bodyHtml}
                    </div>
                `;
                document.body.appendChild(targetElement);
                tempCreated = true;

                // Allow 100ms for layout & style evaluation
                await new Promise(r => setTimeout(r, 100));
            }

            const roleName = report?.title ? report.title.replace(/[^a-zA-Z0-9_-]/g, "_") : "Tailored";
            const opt = {
                margin: [6, 8, 6, 8],
                filename: `ATS_Resume_${roleName}.pdf`,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    logging: false,
                    backgroundColor: "#ffffff",
                    scrollY: 0,
                    scrollX: 0
                },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
                pagebreak: { mode: ["avoid-all", "css", "legacy"] }
            };

            await html2pdf().set(opt).from(targetElement).save();

            // Cleanup if temporary container was created
            if (tempCreated && targetElement && targetElement.parentNode) {
                targetElement.parentNode.removeChild(targetElement);
            }

        } catch (error) {
            console.error("Resume PDF generation failed:", error);
            // Fallback to native print preview
            try {
                const rawHtml = providedHtml || await getResumePreviewHtml(interviewReportId);
                if (rawHtml) {
                    printResumePdf(rawHtml);
                    return;
                }
            } catch (fallbackErr) {
                console.error("Fallback print also failed:", fallbackErr);
            }
            alert("Could not generate PDF directly. Please use 'Print / Save as PDF' to export your resume.");
        } finally {
            setLoading(false);
        }
    };

    // Native Iframe-based Print to PDF (Zero popup blocker issues, clean vector text)
    const printResumePdf = (htmlContent) => {
        if (!htmlContent) return;

        const { fullDocument } = normalizeResumeHtml(htmlContent);

        let iframe = document.getElementById("ats-resume-print-frame");
        if (!iframe) {
            iframe = document.createElement("iframe");
            iframe.id = "ats-resume-print-frame";
            iframe.style.position = "fixed";
            iframe.style.right = "0";
            iframe.style.bottom = "0";
            iframe.style.width = "0";
            iframe.style.height = "0";
            iframe.style.border = "none";
            document.body.appendChild(iframe);
        }

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(fullDocument);
        doc.close();

        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        }, 350);
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