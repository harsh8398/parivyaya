"use client";

import { getSpendingAnalysis } from "@/lib/api";
import { MonthlySpending } from "@/types/api";
import { useEffect, useState } from "react";

export default function AnalysisPage() {
    const [spendingData, setSpendingData] = useState<MonthlySpending[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categoryType, setCategoryType] = useState<"primary" | "detailed">(
        "detailed"
    );

    useEffect(() => {
        const fetchAnalysis = async () => {
            setLoading(true);
            try {
                const data = await getSpendingAnalysis(categoryType);
                setSpendingData(data);
                setError(null);
            } catch (err) {
                setError("Failed to fetch spending analysis");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalysis();
    }, [categoryType]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-CA", {
            style: "currency",
            currency: "CAD",
        }).format(amount);
    };

    const getMonthName = (month: number) => {
        return new Date(2024, month - 1, 1).toLocaleString("default", {
            month: "long",
        });
    };

    const getCategoryColor = (index: number) => {
        const colors = [
            "bg-blue-100 text-blue-800",
            "bg-green-100 text-green-800",
            "bg-yellow-100 text-yellow-800",
            "bg-purple-100 text-purple-800",
            "bg-pink-100 text-pink-800",
            "bg-indigo-100 text-indigo-800",
            "bg-red-100 text-red-800",
            "bg-orange-100 text-orange-800",
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Spend Analysis
                </h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    View your spending breakdown by category and month
                </p>
            </div>

            {/* Category Type Filter */}
            <div className="rounded-lg bg-white p-6 shadow dark:bg-slate-800">
                <label
                    htmlFor="category-type"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    Category Type
                </label>
                <select
                    id="category-type"
                    value={categoryType}
                    onChange={(e) =>
                        setCategoryType(
                            e.target.value as "primary" | "detailed"
                        )
                    }
                    className="mt-1 block w-full max-w-xs rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-slate-700 dark:text-gray-100 sm:text-sm"
                >
                    <option value="detailed">Detailed Categories</option>
                    <option value="primary">Primary Categories</option>
                </select>
            </div>

            {/* Error Message */}
            {error && (
                <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                    <p className="text-sm text-red-800 dark:text-red-400">
                        {error}
                    </p>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="rounded-lg bg-white p-8 text-center shadow dark:bg-slate-800">
                    <p className="text-gray-500 dark:text-gray-400">
                        Loading analysis...
                    </p>
                </div>
            )}

            {/* No Data State */}
            {!loading && !error && spendingData.length === 0 && (
                <div className="rounded-lg bg-white p-8 text-center shadow dark:bg-slate-800">
                    <p className="text-gray-500 dark:text-gray-400">
                        No spending data available. Upload and process
                        transactions to see analysis.
                    </p>
                </div>
            )}

            {/* Monthly Spending Cards */}
            {!loading && !error && spendingData.length > 0 && (
                <div className="space-y-6">
                    {spendingData.map((monthData) => (
                        <div
                            key={`${monthData.year}-${monthData.month}`}
                            className="overflow-hidden rounded-lg bg-white shadow dark:bg-slate-800"
                        >
                            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-slate-900">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    {getMonthName(monthData.month)}{" "}
                                    {monthData.year}
                                </h2>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    Total Spending:{" "}
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                        {formatCurrency(
                                            monthData.total_spending
                                        )}
                                    </span>
                                </p>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {monthData.categories
                                        .sort(
                                            (a, b) =>
                                                b.total_amount - a.total_amount
                                        )
                                        .map((category, index) => (
                                            <div
                                                key={category.category}
                                                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <span
                                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getCategoryColor(
                                                                index
                                                            )}`}
                                                        >
                                                            {category.category}
                                                        </span>
                                                        <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                            {formatCurrency(
                                                                category.total_amount
                                                            )}
                                                        </p>
                                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                            {
                                                                category.transaction_count
                                                            }{" "}
                                                            transaction
                                                            {category.transaction_count !==
                                                            1
                                                                ? "s"
                                                                : ""}
                                                        </p>
                                                        <div className="mt-2">
                                                            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                                                <div
                                                                    className="h-full bg-indigo-600 dark:bg-indigo-500"
                                                                    style={{
                                                                        width: `${
                                                                            (category.total_amount /
                                                                                monthData.total_spending) *
                                                                            100
                                                                        }%`,
                                                                    }}
                                                                />
                                                            </div>
                                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                                {(
                                                                    (category.total_amount /
                                                                        monthData.total_spending) *
                                                                    100
                                                                ).toFixed(1)}
                                                                % of total
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
