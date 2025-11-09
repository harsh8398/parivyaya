"use client";

import { deleteJob } from "@/lib/api";
import { Job } from "@/types/api";
import { useState } from "react";

interface JobsTableProps {
    jobs: Job[];
    loading: boolean;
    onJobDeleted: () => void;
}

function getStatusColor(status: string) {
    switch (status) {
        case "completed":
            return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
        case "processing":
            return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
        case "failed":
            return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
        default:
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
    }
}

export default function JobsTable({
    jobs,
    loading,
    onJobDeleted,
}: JobsTableProps) {
    const [deleting, setDeleting] = useState<string | null>(null);

    const handleDelete = async (jobId: string, filename: string) => {
        if (
            !confirm(
                `Are you sure you want to delete "${filename}" and all its transactions?`
            )
        ) {
            return;
        }

        setDeleting(jobId);
        try {
            await deleteJob(jobId);
            onJobDeleted();
        } catch (error) {
            console.error("Failed to delete job:", error);
            alert("Failed to delete job. Please try again.");
        } finally {
            setDeleting(null);
        }
    };

    if (loading) {
        return (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-slate-800">
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    Loading...
                </div>
            </div>
        );
    }

    if (jobs.length === 0) {
        return (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-slate-800">
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No uploads yet. Upload a PDF to get started.
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-slate-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-slate-900">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Filename
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Transactions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-slate-800">
                    {jobs.map((job) => (
                        <tr
                            key={job.id}
                            className="hover:bg-gray-50 dark:hover:bg-slate-700"
                        >
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                {job.filename}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                <span
                                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(
                                        job.status
                                    )}`}
                                >
                                    {job.status}
                                </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                {job.transaction_count ?? "-"}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                {new Date(job.created_at).toLocaleString()}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                <button
                                    onClick={() =>
                                        handleDelete(job.id, job.filename)
                                    }
                                    disabled={deleting === job.id}
                                    className="text-red-600 hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                                >
                                    {deleting === job.id
                                        ? "Deleting..."
                                        : "Delete"}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
