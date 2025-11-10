"use client";

import {
    Cell,
    Legend,
    Pie,
    PieChart as RechartsPie,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

interface SpendingPieChartProps {
    data: Array<{
        name: string;
        value: number;
        color?: string;
    }>;
    title?: string;
}

const COLORS = [
    "#6366f1", // indigo
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#f59e0b", // amber
    "#10b981", // emerald
    "#3b82f6", // blue
    "#f97316", // orange
    "#14b8a6", // teal
    "#a855f7", // purple
    "#06b6d4", // cyan
];

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
}: {
    active?: boolean;
    payload?: Array<{ name: string; value: number }>;
}) {
    if (active && payload && payload.length) {
        const data = payload[0];
        const total = payload.reduce((sum, item) => sum + item.value, 0);
        const percentage = ((data.value / total) * 100).toFixed(1);

        return (
            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-slate-800">
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {data.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatCurrency(data.value)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                    {percentage}% of total
                </p>
            </div>
        );
    }
    return null;
}

function CustomLabel({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
}: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
}) {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label for small slices

    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor={x > cx ? "start" : "end"}
            dominantBaseline="central"
            className="text-xs font-semibold"
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
}

export function SpendingPieChart({ data, title }: SpendingPieChartProps) {
    const chartData = data.map((item, index) => ({
        ...item,
        color: item.color || COLORS[index % COLORS.length],
    }));

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-slate-800">
            {title && (
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {title}
                </h3>
            )}
            <ResponsiveContainer width="100%" height={400}>
                <RechartsPie>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props) => CustomLabel(props as any)}
                        outerRadius={130}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => (
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {value}
                            </span>
                        )}
                    />
                </RechartsPie>
            </ResponsiveContainer>
        </div>
    );
}
