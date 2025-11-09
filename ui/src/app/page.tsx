"use client";

import JobsTable from "@/components/JobsTable";
import UploadForm from "@/components/UploadForm";
import { getJobs, uploadPdf } from "@/lib/api";
import { Job } from "@/types/api";
import { useEffect, useState } from "react";

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchJobs = async () => {
        try {
            const data = await getJobs();
            setJobs(data);
            setError(null);
        } catch (err) {
            setError("Failed to fetch jobs");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
        // Refresh jobs every 5 seconds for live updates
        const interval = setInterval(fetchJobs, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        try {
            await uploadPdf(file);
            setFile(null);
            // Reset file input
            const fileInput = document.getElementById(
                "file-upload"
            ) as HTMLInputElement;
            if (fileInput) fileInput.value = "";
            // Refresh jobs immediately
            await fetchJobs();
        } catch (err) {
            setError("Failed to upload file");
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Upload PDF Statement
                </h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Upload a bank statement PDF to extract transactions using AI
                </p>
            </div>

            <UploadForm
                file={file}
                uploading={uploading}
                onFileChange={handleFileChange}
                onSubmit={handleSubmit}
            />

            {error && (
                <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                    <p className="text-sm text-red-800 dark:text-red-400">
                        {error}
                    </p>
                </div>
            )}

            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Upload History
                </h2>
                <div className="mt-4">
                    <JobsTable
                        jobs={jobs}
                        loading={loading}
                        onJobDeleted={fetchJobs}
                    />
                </div>
            </div>
        </div>
    );
}
