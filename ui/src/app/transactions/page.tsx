"use client";

import { getJobs, getTransactions } from "@/lib/api";
import { Job, Transaction } from "@/types/api";
import { useEffect, useState } from "react";

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedJobId, setSelectedJobId] = useState<string>("");
    const [limit, setLimit] = useState(100);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await getJobs();
                setJobs(data);
            } catch (err) {
                console.error("Failed to fetch jobs:", err);
            }
        };
        fetchJobs();
    }, []);

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const data = await getTransactions(
                    selectedJobId || undefined,
                    limit,
                    0
                );
                setTransactions(data);
                setError(null);
            } catch (err) {
                setError("Failed to fetch transactions");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, [selectedJobId, limit]);

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat("en-CA", {
            style: "currency",
            currency: currency,
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Transactions
                </h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    View and filter all extracted transactions
                </p>
            </div>

            {/* Filters */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-slate-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Filters
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="job-filter"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Filter by Upload
                        </label>
                        <select
                            id="job-filter"
                            value={selectedJobId}
                            onChange={(e) => setSelectedJobId(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-slate-700 dark:text-gray-100 sm:text-sm"
                        >
                            <option value="">All Jobs</option>
                            {jobs
                                .filter(
                                    (job) =>
                                        job.status.toLowerCase() === "completed"
                                )
                                .map((job) => (
                                    <option key={job.id} value={job.id}>
                                        {job.filename} ({job.transaction_count}{" "}
                                        transactions)
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div>
                        <label
                            htmlFor="limit-filter"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Results per page
                        </label>
                        <select
                            id="limit-filter"
                            value={limit}
                            onChange={(e) => setLimit(Number(e.target.value))}
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-slate-700 dark:text-gray-100 sm:text-sm"
                        >
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={200}>200</option>
                            <option value={500}>500</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                    <p className="text-sm text-red-800 dark:text-red-400">
                        {error}
                    </p>
                </div>
            )}

            {/* Transactions Table */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-slate-800">
                {loading ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        Loading...
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No transactions found. Upload a PDF to extract
                        transactions.
                    </div>
                ) : (
                    <>
                        <div className="px-6 py-4">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Showing{" "}
                                <span className="font-medium">
                                    {transactions.length}
                                </span>{" "}
                                transactions
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-slate-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Description
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Type
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-slate-800">
                                    {transactions.map((transaction) => (
                                        <tr
                                            key={transaction.id}
                                            className="hover:bg-gray-50 dark:hover:bg-slate-700"
                                        >
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                {new Date(
                                                    transaction.date
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                {transaction.title}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                {formatCurrency(
                                                    transaction.amount,
                                                    transaction.currency
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                {transaction.category_detailed}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                                    {
                                                        transaction.category_primary
                                                    }
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
