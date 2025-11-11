import {
    CategoryTrend,
    Job,
    MonthlySpending,
    TopTransaction,
    Transaction,
    UnusualTransaction,
    UploadResponse,
} from "@/types/api";
import {
    generateCategoryTrends,
    generateDummyJobs,
    generateDummyTransactions,
    generateMonthlySpending,
    generateTopTransactions,
    generateUnusualTransactions,
} from "./dummyData";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export async function uploadPdf(file: File): Promise<UploadResponse> {
    if (DEMO_MODE) {
        // In demo mode, simulate upload
        return Promise.resolve({
            job_id: "demo-job-upload",
            status: "completed",
            message: "Demo mode: File upload simulated",
        });
    }

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
    if (DEMO_MODE) {
        const jobs = generateDummyJobs();
        return Promise.resolve(
            status ? jobs.filter((j) => j.status === status) : jobs
        );
    }

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
    if (DEMO_MODE) {
        const jobs = generateDummyJobs();
        const job = jobs.find((j) => j.id === jobId);
        if (!job) {
            throw new Error("Job not found");
        }
        return Promise.resolve(job);
    }

    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
    if (!response.ok) {
        throw new Error("Failed to fetch job");
    }

    return response.json();
}

export async function deleteJob(jobId: string): Promise<void> {
    if (DEMO_MODE) {
        // In demo mode, simulate deletion
        return Promise.resolve();
    }

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
    if (DEMO_MODE) {
        let transactions = generateDummyTransactions(300);
        if (jobId) {
            transactions = transactions.filter((t) => t.job_id === jobId);
        }
        return Promise.resolve(transactions.slice(offset, offset + limit));
    }

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
    if (DEMO_MODE) {
        return Promise.resolve(generateMonthlySpending(categoryType));
    }

    const url = new URL(`${API_BASE_URL}/spending/analysis`);
    url.searchParams.append("category_type", categoryType);

    const response = await fetch(url.toString());
    if (!response.ok) {
        throw new Error("Failed to fetch spending analysis");
    }

    return response.json();
}

export async function getTopTransactions(
    limit: number = 10,
    categoryType: "primary" | "detailed" = "detailed"
): Promise<TopTransaction[]> {
    if (DEMO_MODE) {
        return Promise.resolve(generateTopTransactions(limit, categoryType));
    }

    const url = new URL(`${API_BASE_URL}/spending/top-transactions`);
    url.searchParams.append("limit", limit.toString());
    url.searchParams.append("category_type", categoryType);

    const response = await fetch(url.toString());
    if (!response.ok) {
        throw new Error("Failed to fetch top transactions");
    }

    return response.json();
}

export async function getUnusualTransactions(
    threshold: number = 2.0,
    limit: number = 10,
    categoryType: "primary" | "detailed" = "detailed"
): Promise<UnusualTransaction[]> {
    if (DEMO_MODE) {
        return Promise.resolve(
            generateUnusualTransactions(threshold, limit, categoryType)
        );
    }

    const url = new URL(`${API_BASE_URL}/spending/unusual-transactions`);
    url.searchParams.append("threshold", threshold.toString());
    url.searchParams.append("limit", limit.toString());
    url.searchParams.append("category_type", categoryType);

    const response = await fetch(url.toString());
    if (!response.ok) {
        throw new Error("Failed to fetch unusual transactions");
    }

    return response.json();
}

export async function getCategoryTrends(
    categoryType: "primary" | "detailed" = "detailed",
    topN: number = 5
): Promise<CategoryTrend[]> {
    if (DEMO_MODE) {
        return Promise.resolve(generateCategoryTrends(categoryType, topN));
    }

    const url = new URL(`${API_BASE_URL}/spending/category-trends`);
    url.searchParams.append("category_type", categoryType);
    url.searchParams.append("top_n", topN.toString());

    const response = await fetch(url.toString());
    if (!response.ok) {
        throw new Error("Failed to fetch category trends");
    }

    return response.json();
}
