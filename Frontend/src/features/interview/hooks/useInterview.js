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


    // Generate / Download ATS Resume in Real PDF Format using html2pdf.js
    const getResumePdf = async (interviewReportId, providedHtml = null) => {
        setLoading(true);

        try {
            // 1. Obtain the tailored resume HTML
            let html = providedHtml;
            if (!html) {
                html = await getResumePreviewHtml(interviewReportId);
            }

            if (!html) {
                throw new Error("Resume content is not available yet. Please try again.");
            }

            // 2. Dynamically load html2pdf.js
            const html2pdfModule = await import("html2pdf.js");
            const html2pdf = html2pdfModule.default || html2pdfModule;

            // 3. Create a clean A4 wrapper in the DOM for high-resolution rendering
            const wrapper = document.createElement("div");
            wrapper.style.position = "fixed";
            wrapper.style.left = "-9999px";
            wrapper.style.top = "0";
            wrapper.style.width = "800px";
            wrapper.style.background = "#ffffff";
            wrapper.style.color = "#111827";
            wrapper.style.padding = "24px 32px";
            wrapper.style.boxSizing = "border-box";
            wrapper.style.fontFamily = "Arial, Helvetica, sans-serif";
            wrapper.innerHTML = html;

            document.body.appendChild(wrapper);

            const roleName = report?.title ? report.title.replace(/[^a-zA-Z0-9_-]/g, "_") : "Tailored";
            const opt = {
                margin: [8, 8, 8, 8],
                filename: `ATS_Resume_${roleName}.pdf`,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    logging: false,
                    windowWidth: 800
                },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
                pagebreak: { mode: ["avoid-all", "css", "legacy"] }
            };

            await html2pdf().set(opt).from(wrapper).save();

            // Cleanup DOM
            document.body.removeChild(wrapper);

        } catch (error) {
            console.error("Resume PDF generation failed:", error);
            // Fallback to iframe-based native print dialog
            try {
                const html = providedHtml || await getResumePreviewHtml(interviewReportId);
                if (html) {
                    printResumePdf(html);
                    return;
                }
            } catch (fallbackErr) {
                console.error("Fallback print also failed:", fallbackErr);
            }
            alert("Could not generate PDF directly. Please click 'Print / Save as PDF' to export your resume.");
        } finally {
            setLoading(false);
        }
    };

    // Native Iframe-based Print to PDF (Zero popup blocker issues)
    const printResumePdf = (htmlContent) => {
        if (!htmlContent) return;

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
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
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
                        padding: 0 !important;
                        font-family: Arial, Helvetica, sans-serif !important;
                        color: #000 !important;
                        background: #fff !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                </style>
            </head>
            <body>
                ${htmlContent}
            </body>
            </html>
        `);
        doc.close();

        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        }, 300);
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