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


    // Generate / Download Resume PDF
   const getResumePdf = async (interviewReportId) => {
    setLoading(true);

    try {

        const response = await generateResumePdf({
            interviewReportId
        });

        const url = window.URL.createObjectURL(
            new Blob(
                [response],
                {
                    type: "application/pdf"
                }
            )
        );

        const link = document.createElement("a");

        link.href = url;

        link.setAttribute(
            "download",
            `resume_${interviewReportId}.pdf`
        );

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);

    } catch (error) {

        console.log(error);

    } finally {

        setLoading(false);

    }
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
        getResumePreviewHtml
    };

};