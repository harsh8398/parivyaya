import { Job, MonthlySpending, Transaction, UploadResponse } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function uploadPdf(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Failed to upload PDF");
    }

    return response.json();
}

export async function getJobs(status?: string): Promise<Job[]> {
    const url = new URL(`${API_BASE_URL}/jobs`);
    if (status) {
        url.searchParams.append("status", status);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
        throw new Error("Failed to fetch jobs");
    }

    return response.json();
}

export async function getJob(jobId: string): Promise<Job> {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
    if (!response.ok) {
        throw new Error("Failed to fetch job");
    }

    return response.json();
}

export async function deleteJob(jobId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Failed to delete job");
    }

    return response.json();
}

export async function getTransactions(
    jobId?: string,
    limit: number = 100,
    offset: number = 0
): Promise<Transaction[]> {
    const url = new URL(`${API_BASE_URL}/transactions`);
    if (jobId) {
        url.searchParams.append("job_id", jobId);
    }
    url.searchParams.append("limit", limit.toString());
    url.searchParams.append("offset", offset.toString());

    const response = await fetch(url.toString());
    if (!response.ok) {
        throw new Error("Failed to fetch transactions");
    }

    return response.json();
}

export async function getSpendingAnalysis(
    categoryType: "primary" | "detailed" = "detailed"
): Promise<MonthlySpending[]> {
    const url = new URL(`${API_BASE_URL}/spending/analysis`);
    url.searchParams.append("category_type", categoryType);

    const response = await fetch(url.toString());
    if (!response.ok) {
        throw new Error("Failed to fetch spending analysis");
    }

    return response.json();
}
