import DemoBanner from "@/components/DemoBanner";
import Navigation from "@/components/Navigation";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Parivyaya - Financial Transaction Manager",
    description: "AI-powered financial transaction extraction and analysis",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            try {
                                const theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                                document.documentElement.classList.toggle('dark', theme === 'dark');
                            } catch (e) {}
                        `,
                    }}
                />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-white text-gray-900 antialiased dark:bg-slate-900 dark:text-gray-100`}
            >
                <DemoBanner />
                <Navigation />
                <main className="mx-auto max-w-7xl bg-gray-50 px-4 py-8 dark:bg-slate-900 sm:px-6 lg:px-8">
                    {children}
                </main>
            </body>
        </html>
    );
}
