"use client";

import {
    CartesianGrid,
    Legend,
    Line,
    LineChart as RechartsLineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface TrendLineChartProps {
    data: Array<{
        month: string;
        [key: string]: string | number;
    }>;
    lines: Array<{
        dataKey: string;
        name: string;
        color: string;
    }>;
    title?: string;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

function CustomTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
}) {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-slate-800">
                <p className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                    {label}
                </p>
                {payload.map((entry, index) => (
                    <p
                        key={index}
                        className="text-sm"
                        style={{ color: entry.color }}
                    >
                        {entry.name}: {formatCurrency(entry.value)}
                    </p>
                ))}
            </div>
        );
    }
    return null;
}

export function TrendLineChart({ data, lines, title }: TrendLineChartProps) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-slate-800">
            {title && (
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {title}
                </h3>
            )}
            <ResponsiveContainer width="100%" height={400}>
                <RechartsLineChart data={data}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-gray-200 dark:stroke-gray-700"
                    />
                    <XAxis
                        dataKey="month"
                        className="text-xs text-gray-600 dark:text-gray-400"
                        tick={{ fill: "currentColor" }}
                    />
                    <YAxis
                        className="text-xs text-gray-600 dark:text-gray-400"
                        tick={{ fill: "currentColor" }}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{
                            paddingTop: "20px",
                        }}
                        formatter={(value) => (
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {value}
                            </span>
                        )}
                    />
                    {lines.map((line) => (
                        <Line
                            key={line.dataKey}
                            type="monotone"
                            dataKey={line.dataKey}
                            name={line.name}
                            stroke={line.color}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    ))}
                </RechartsLineChart>
            </ResponsiveContainer>
        </div>
    );
}
