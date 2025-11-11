/**
 * Dummy data generator for demo mode
 * Uses category definitions from backend data/categories.csv
 */

import {
    CategoryTrend,
    Job,
    MonthlySpending,
    TopTransaction,
    Transaction,
    UnusualTransaction,
} from "@/types/api";

// Category definitions from backend
const CATEGORIES = {
    Essential: [
        {
            category: "Family Support",
            examples: ["Remittly transfer", "Family remittance"],
        },
        {
            category: "Groceries",
            examples: ["FreshCo", "No Frills", "Costco", "Metro"],
        },
        {
            category: "Rent",
            examples: ["Monthly rent payment", "Apartment rent"],
        },
        {
            category: "Utilities",
            examples: ["Rogers Internet", "Hydro One", "Fido Mobile"],
        },
        {
            category: "Immigration",
            examples: ["IRCC fee", "IELTS exam", "Translation service"],
        },
        {
            category: "Health",
            examples: ["Protein powder", "Vitamins", "GoodLife Fitness"],
        },
        { category: "Home", examples: ["IKEA furniture", "Mop", "Mattress"] },
        {
            category: "Personal Development",
            examples: ["Udemy course", "Technical books", "Coursera"],
        },
        {
            category: "Personal Care",
            examples: ["Toothpaste", "Body wash", "Haircut"],
        },
        {
            category: "Transportation",
            examples: ["Presto card", "Gas station", "Enterprise rent"],
        },
        {
            category: "Stationary",
            examples: ["Staples", "Notebooks", "Printer paper"],
        },
        {
            category: "Investment",
            examples: ["RRSP contribution", "TFSA", "ETF purchase"],
        },
        {
            category: "Liabilities",
            examples: ["Student loan", "Mortgage payment", "CRA tax"],
        },
        {
            category: "Miscellaneous",
            examples: ["E-transfer", "Cash withdraw"],
        },
        {
            category: "Income",
            examples: ["Monthly salary", "Tax return", "Refund"],
        },
    ],
    Luxury: [
        {
            category: "Dine out",
            examples: ["McDonald's", "Tim Hortons", "Swiss Chalet"],
        },
        {
            category: "Travel",
            examples: ["Airbnb", "Air Canada", "CN Tower tickets"],
        },
        {
            category: "Shopping",
            examples: ["Tommy Hilfiger", "Nike", "Souvenir keychain"],
        },
        {
            category: "Home+",
            examples: ["Samsung TV", "Projector", "PlayStation 5"],
        },
        {
            category: "Subscriptions",
            examples: ["Netflix", "Spotify Premium", "iCloud+"],
        },
        {
            category: "Gifts",
            examples: ["Anniversary gift", "Birthday present"],
        },
        {
            category: "Recreational",
            examples: [
                "Cineplex",
                "Dave & Buster's",
                "Spa day",
                "Concert tickets",
            ],
        },
    ],
    Transfers: [
        {
            category: "Transfers",
            examples: [
                "Account transfer",
                "Credit card payment",
                "Network fees",
            ],
        },
    ],
};

// Helper to get random item from array
const randomItem = <T>(arr: T[]): T =>
    arr[Math.floor(Math.random() * arr.length)];

// Helper to generate random date in the past year
const randomDate = (monthsBack: number = 12): Date => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
    const end = new Date();
    return new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
};

// Helper to generate random amount based on category
const randomAmount = (categoryName: string): number => {
    const ranges: { [key: string]: [number, number] } = {
        "Family Support": [200, 1000],
        Groceries: [20, 150],
        Rent: [1200, 2500],
        Utilities: [50, 200],
        Immigration: [100, 500],
        Health: [20, 100],
        Home: [50, 500],
        "Personal Development": [20, 200],
        "Personal Care": [10, 80],
        Transportation: [30, 150],
        Stationary: [5, 50],
        Investment: [100, 2000],
        Liabilities: [200, 1500],
        Miscellaneous: [10, 100],
        Income: [2000, 5000],
        "Dine out": [10, 80],
        Travel: [100, 1500],
        Shopping: [30, 300],
        "Home+": [200, 1500],
        Subscriptions: [10, 30],
        Gifts: [50, 200],
        Recreational: [30, 200],
        Transfers: [50, 1000],
    };

    const [min, max] = ranges[categoryName] || [10, 100];
    return Math.round((min + Math.random() * (max - min)) * 100) / 100;
};

// Generate dummy jobs
export const generateDummyJobs = (count: number = 3): Job[] => {
    const jobs: Job[] = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
        const createdAt = new Date(
            now.getTime() - (count - i) * 7 * 24 * 60 * 60 * 1000
        );
        const startedAt = new Date(createdAt.getTime() + 1000);
        const completedAt = new Date(
            startedAt.getTime() + 5000 + Math.random() * 10000
        );

        jobs.push({
            id: `demo-job-${i + 1}`,
            filename: `statement-${2024 - i}.pdf`,
            status: "completed",
            created_at: createdAt.toISOString(),
            started_at: startedAt.toISOString(),
            completed_at: completedAt.toISOString(),
            error_message: null,
            transaction_count: 50 + Math.floor(Math.random() * 100),
        });
    }

    return jobs;
};

// Generate dummy transactions
export const generateDummyTransactions = (
    count: number = 200
): Transaction[] => {
    const transactions: Transaction[] = [];
    const allCategories = [
        ...CATEGORIES.Essential,
        ...CATEGORIES.Luxury,
        ...CATEGORIES.Transfers,
    ];
    const jobs = generateDummyJobs();

    for (let i = 0; i < count; i++) {
        const categoryMeta = randomItem(allCategories);
        const categoryPrimary =
            Object.entries(CATEGORIES).find(([, cats]) =>
                cats.some((c) => c.category === categoryMeta.category)
            )?.[0] || "Essential";

        const date = randomDate(12);
        const example = randomItem(categoryMeta.examples);
        const amount = randomAmount(categoryMeta.category);

        // Income should be positive, others negative
        const finalAmount =
            categoryMeta.category === "Income" ? amount : -amount;

        transactions.push({
            id: i + 1,
            job_id: randomItem(jobs).id,
            date: date.toISOString(),
            title: example,
            amount: finalAmount,
            currency: "CAD",
            category_primary: categoryPrimary,
            category_detailed: categoryMeta.category,
            category_confidence_level: randomItem(["high", "medium", "low"]),
            created_at: date.toISOString(),
        });
    }

    // Sort by date descending
    return transactions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
};

// Generate monthly spending data
export const generateMonthlySpending = (
    categoryType: "primary" | "detailed" = "detailed"
): MonthlySpending[] => {
    const monthlyData: MonthlySpending[] = [];
    const now = new Date();
    const transactions = generateDummyTransactions(300);

    for (let i = 0; i < 12; i++) {
        const year = now.getFullYear();
        const month = now.getMonth() - i + 1;
        const adjustedYear = month <= 0 ? year - 1 : year;
        const adjustedMonth = month <= 0 ? 12 + month : month;

        const monthStart = new Date(adjustedYear, adjustedMonth - 1, 1);
        const monthEnd = new Date(adjustedYear, adjustedMonth, 0, 23, 59, 59);

        const monthTransactions = transactions.filter((t) => {
            const tDate = new Date(t.date);
            return tDate >= monthStart && tDate <= monthEnd && t.amount < 0; // Only expenses
        });

        const categoryMap = new Map<string, { total: number; count: number }>();

        monthTransactions.forEach((t) => {
            const category =
                categoryType === "primary"
                    ? t.category_primary
                    : t.category_detailed;
            const existing = categoryMap.get(category) || {
                total: 0,
                count: 0,
            };
            categoryMap.set(category, {
                total: existing.total + Math.abs(t.amount),
                count: existing.count + 1,
            });
        });

        const categories = Array.from(categoryMap.entries()).map(
            ([category, data]) => ({
                category,
                total_amount: Math.round(data.total * 100) / 100,
                transaction_count: data.count,
            })
        );

        const totalSpending = categories.reduce(
            (sum, c) => sum + c.total_amount,
            0
        );

        monthlyData.push({
            year: adjustedYear,
            month: adjustedMonth,
            categories,
            total_spending: Math.round(totalSpending * 100) / 100,
        });
    }

    return monthlyData.reverse();
};

// Generate top transactions
export const generateTopTransactions = (
    limit: number = 10,
    categoryType: "primary" | "detailed" = "detailed"
): TopTransaction[] => {
    const transactions = generateDummyTransactions(300);
    const expenses = transactions.filter((t) => t.amount < 0);

    return expenses
        .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
        .slice(0, limit)
        .map((t) => ({
            id: t.id,
            date: new Date(t.date).toLocaleDateString("en-CA"),
            title: t.title,
            amount: Math.abs(t.amount),
            category:
                categoryType === "primary"
                    ? t.category_primary
                    : t.category_detailed,
        }));
};

// Generate unusual transactions
export const generateUnusualTransactions = (
    threshold: number = 2.0,
    limit: number = 10,
    categoryType: "primary" | "detailed" = "detailed"
): UnusualTransaction[] => {
    const transactions = generateDummyTransactions(300);
    const expenses = transactions.filter((t) => t.amount < 0);

    // Calculate average by category
    const categoryAverages = new Map<string, number>();
    const categoryCounts = new Map<string, number>();

    expenses.forEach((t) => {
        const category =
            categoryType === "primary"
                ? t.category_primary
                : t.category_detailed;
        const current = categoryAverages.get(category) || 0;
        const count = categoryCounts.get(category) || 0;
        categoryAverages.set(category, current + Math.abs(t.amount));
        categoryCounts.set(category, count + 1);
    });

    categoryAverages.forEach((total, category) => {
        const count = categoryCounts.get(category) || 1;
        categoryAverages.set(category, total / count);
    });

    // Find unusual transactions
    const unusual: UnusualTransaction[] = [];

    expenses.forEach((t) => {
        const category =
            categoryType === "primary"
                ? t.category_primary
                : t.category_detailed;
        const average = categoryAverages.get(category) || 0;
        const amount = Math.abs(t.amount);
        const deviation = average > 0 ? (amount - average) / average : 0;

        if (deviation >= threshold) {
            unusual.push({
                id: t.id,
                date: new Date(t.date).toLocaleDateString("en-CA"),
                title: t.title,
                amount,
                category,
                average_amount: Math.round(average * 100) / 100,
                deviation_percentage: Math.round(deviation * 100),
            });
        }
    });

    return unusual
        .sort((a, b) => b.deviation_percentage - a.deviation_percentage)
        .slice(0, limit);
};

// Generate category trends
export const generateCategoryTrends = (
    categoryType: "primary" | "detailed" = "detailed",
    topN: number = 5
): CategoryTrend[] => {
    const monthlySpending = generateMonthlySpending(categoryType);

    // Aggregate across all months to find top categories
    const categoryTotals = new Map<string, number>();

    monthlySpending.forEach((month) => {
        month.categories.forEach((cat) => {
            const current = categoryTotals.get(cat.category) || 0;
            categoryTotals.set(cat.category, current + cat.total_amount);
        });
    });

    // Get top N categories
    const topCategories = Array.from(categoryTotals.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN)
        .map(([category]) => category);

    // Build trend data for each top category
    return topCategories.map((category) => ({
        category,
        data: monthlySpending.map((month) => {
            const categoryData = month.categories.find(
                (c) => c.category === category
            );
            return {
                month: `${month.year}-${String(month.month).padStart(2, "0")}`,
                amount: categoryData ? categoryData.total_amount : 0,
            };
        }),
    }));
};
