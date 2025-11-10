export interface Job {
    id: string;
    filename: string;
    status: "pending" | "processing" | "completed" | "failed";
    created_at: string;
    started_at: string | null;
    completed_at: string | null;
    error_message: string | null;
    transaction_count: number | null;
}

export interface Transaction {
    id: number;
    job_id: string;
    date: string;
    title: string;
    amount: number;
    currency: string;
    category_primary: string;
    category_detailed: string;
    category_confidence_level: string;
    created_at: string;
}

export interface UploadResponse {
    job_id: string;
    status: string;
    message: string;
}

export interface CategorySpending {
    category: string;
    total_amount: number;
    transaction_count: number;
}

export interface MonthlySpending {
    year: number;
    month: number;
    categories: CategorySpending[];
    total_spending: number;
}

export interface TopTransaction {
    id: number;
    date: string;
    title: string;
    amount: number;
    category: string;
}

export interface UnusualTransaction {
    id: number;
    date: string;
    title: string;
    amount: number;
    category: string;
    average_amount: number;
    deviation_percentage: number;
}

export interface CategoryTrend {
    category: string;
    data: Array<{
        month: string;
        amount: number;
    }>;
}
