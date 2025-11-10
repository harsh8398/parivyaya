import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        label: string;
        isPositive?: boolean;
    };
    className?: string;
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    trend,
    className = "",
}: StatsCardProps) {
    return (
        <div
            className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-slate-800 ${className}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {title}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {value}
                    </p>
                    {trend && (
                        <p className="mt-2 flex items-center text-sm">
                            <span
                                className={`font-semibold ${
                                    trend.isPositive
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-red-600 dark:text-red-400"
                                }`}
                            >
                                {trend.value > 0 ? "+" : ""}
                                {trend.value}%
                            </span>
                            <span className="ml-2 text-gray-600 dark:text-gray-400">
                                {trend.label}
                            </span>
                        </p>
                    )}
                </div>
                <div className="rounded-full bg-indigo-100 p-3 dark:bg-indigo-900/30">
                    <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
            </div>
        </div>
    );
}
