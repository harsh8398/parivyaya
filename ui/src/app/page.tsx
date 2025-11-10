"use client";

import { SpendingPieChart } from "@/components/charts/SpendingPieChart";
import { StatsCard } from "@/components/charts/StatsCard";
import { TopTransactionsTable } from "@/components/charts/TopTransactionsTable";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { UnusualTransactionsTable } from "@/components/charts/UnusualTransactionsTable";
import {
    getCategoryTrends,
    getTopTransactions,
    getUnusualTransactions,
} from "@/lib/api";
import { CategoryTrend, TopTransaction, UnusualTransaction } from "@/types/api";
import { DollarSign, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

export default function AnalysisPage() {
    const [categoryTrends, setCategoryTrends] = useState<CategoryTrend[]>([]);
    const [topTransactions, setTopTransactions] = useState<TopTransaction[]>(
        []
    );
    const [unusualTransactions, setUnusualTransactions] = useState<
        UnusualTransaction[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categoryType, setCategoryType] = useState<"primary" | "detailed">(
        "detailed"
    );

    useEffect(() => {
        const fetchAnalysis = async () => {
            setLoading(true);
            try {
                const [trends, top, unusual] = await Promise.all([
                    getCategoryTrends(categoryType, 5),
                    getTopTransactions(10, categoryType),
                    getUnusualTransactions(2.0, 10, categoryType),
                ]);

                setCategoryTrends(trends);
                setTopTransactions(top);
                setUnusualTransactions(unusual);
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

    // Calculate stats from the data
    const totalSpending =
        topTransactions.length > 0
            ? topTransactions.reduce((sum, t) => sum + t.amount, 0)
            : 0;

    const averageTransaction =
        topTransactions.length > 0 ? totalSpending / topTransactions.length : 0;

    // Prepare data for pie chart
    const pieChartData =
        categoryTrends.length > 0
            ? categoryTrends.map((trend) => ({
                  name: trend.category,
                  value: trend.data.reduce((sum, item) => sum + item.amount, 0),
              }))
            : [];

    // Prepare data for trend line chart
    const trendLineData:
        | Array<{ month: string; [key: string]: string | number }>
        | [] =
        categoryTrends.length > 0 && categoryTrends[0].data.length > 0
            ? categoryTrends[0].data.map((item) => {
                  const dataPoint: {
                      month: string;
                      [key: string]: string | number;
                  } = {
                      month: item.month,
                  };
                  categoryTrends.forEach((trend) => {
                      const monthData = trend.data.find(
                          (d) => d.month === item.month
                      );
                      dataPoint[trend.category] = monthData
                          ? monthData.amount
                          : 0;
                  });
                  return dataPoint;
              })
            : [];

    const trendLines =
        categoryTrends.length > 0
            ? categoryTrends.map((trend, index) => {
                  const colors = [
                      "#6366f1",
                      "#8b5cf6",
                      "#ec4899",
                      "#f59e0b",
                      "#10b981",
                  ];
                  return {
                      dataKey: trend.category,
                      name: trend.category,
                      color: colors[index % colors.length],
                  };
              })
            : [];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Spend Analysis
                </h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    View your spending breakdown by category and trends
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
            {!loading && !error && categoryTrends.length === 0 && (
                <div className="rounded-lg bg-white p-8 text-center shadow dark:bg-slate-800">
                    <p className="text-gray-500 dark:text-gray-400">
                        No spending data available. Upload and process
                        transactions to see analysis.
                    </p>
                </div>
            )}

            {/* Analysis Dashboard */}
            {!loading && !error && categoryTrends.length > 0 && (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <StatsCard
                            title="Total Spending"
                            value={`$${totalSpending.toFixed(2)}`}
                            icon={DollarSign}
                        />
                        <StatsCard
                            title="Categories Tracked"
                            value={categoryTrends.length}
                            icon={Wallet}
                        />
                        <StatsCard
                            title="Top Transaction"
                            value={
                                topTransactions.length > 0
                                    ? `$${topTransactions[0].amount.toFixed(2)}`
                                    : "$0"
                            }
                            icon={TrendingUp}
                        />
                        <StatsCard
                            title="Avg Transaction"
                            value={`$${averageTransaction.toFixed(2)}`}
                            icon={TrendingDown}
                        />
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <SpendingPieChart
                            data={pieChartData}
                            title="Spending by Category"
                        />
                        {trendLineData.length > 0 && (
                            <TrendLineChart
                                data={trendLineData}
                                lines={trendLines}
                                title="Category Trends Over Time"
                            />
                        )}
                    </div>

                    {/* Tables Row */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <TopTransactionsTable transactions={topTransactions} />
                        <UnusualTransactionsTable
                            transactions={unusualTransactions}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
