import { UnusualTransaction } from "@/types/api";
import { AlertTriangle } from "lucide-react";

interface UnusualTransactionsTableProps {
    transactions: UnusualTransaction[];
    title?: string;
}

export function UnusualTransactionsTable({
    transactions,
    title = "Unusual Transactions",
}: UnusualTransactionsTableProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-CA", {
            style: "currency",
            currency: "CAD",
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-CA", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-slate-800">
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {title}
                    </h3>
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Transactions that deviate significantly from category
                    averages
                </p>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.length === 0 ? (
                    <div className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        No unusual transactions detected
                    </div>
                ) : (
                    transactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            className="px-6 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-slate-700"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {formatDate(transaction.date)}
                                        </span>
                                        <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                            {transaction.category}
                                        </span>
                                    </div>
                                    <p
                                        className="mt-1 truncate text-sm font-medium text-gray-900 dark:text-gray-100"
                                        title={transaction.title}
                                    >
                                        {transaction.title}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-4 text-xs">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Avg:{" "}
                                            {formatCurrency(
                                                transaction.average_amount
                                            )}
                                        </span>
                                        <span
                                            className={`font-semibold ${
                                                transaction.deviation_percentage >
                                                0
                                                    ? "text-red-600 dark:text-red-400"
                                                    : "text-green-600 dark:text-green-400"
                                            }`}
                                        >
                                            {transaction.deviation_percentage >
                                            0
                                                ? "+"
                                                : ""}
                                            {transaction.deviation_percentage.toFixed(
                                                1
                                            )}
                                            % deviation
                                        </span>
                                    </div>
                                </div>
                                <div className="shrink-0 text-right">
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {formatCurrency(transaction.amount)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
