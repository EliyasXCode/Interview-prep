import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:3000");

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


/**
 * @description Service to generate interview report based on user self description, resume and job description.
 */
export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile, resumeText }) => {

    const formData = new FormData()
    formData.append("jobDescription", jobDescription || "")
    formData.append("selfDescription", selfDescription || "")
    if (resumeFile) {
        formData.append("resume", resumeFile)
    }
    if (resumeText) {
        formData.append("resumeText", resumeText)
    }

    const response = await api.post("/api/interview/", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })

    return response.data

}


/**
 * @description Service to get interview report by interviewId.
 */
export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/interview/report/${interviewId}`)

    return response.data
}


/**
 * @description Service to get all interview reports of logged in user.
 */
export const getAllInterviewReports = async () => {
    const response = await api.get("/api/interview/")

    return response.data
}


/**
 * @description Service to generate resume pdf based on user self description, resume content and job description.
 */
export const generateResumePdf = async ({ interviewReportId }) => {
    const response = await api.get(`/api/interview/resume/pdf/${interviewReportId}`, {
        responseType: "blob"
    })

    return response.data
}

/**
 * @description Service to get tailored resume HTML for preview
 */
export const getResumePreview = async ({ interviewReportId }) => {
    const response = await api.get(`/api/interview/resume/preview/${interviewReportId}`)

    return response.data
}