"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

export default function Navigation() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Upload" },
        { href: "/transactions", label: "Transactions" },
        { href: "/analysis", label: "Spend Analysis" },
    ];

    return (
        <nav className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-slate-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                    <div className="flex">
                        <div className="flex shrink-0 items-center">
                            <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                Parivyaya
                            </h1>
                        </div>
                        <div className="ml-6 flex space-x-8">
                            {links.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors ${
                                            isActive
                                                ? "border-indigo-500 text-gray-900 dark:border-indigo-400 dark:text-gray-100"
                                                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex items-center">
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </nav>
    );
}
