"use client";

import { Github, Info } from "lucide-react";

export default function DemoBanner() {
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

    if (!isDemoMode) {
        return null;
    }

    return (
        <div className="bg-linear-to-r from-amber-500 to-orange-500 px-4 py-3 text-white shadow-md">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-3">
                <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 shrink-0" />
                    <p className="text-sm font-medium sm:text-base">
                        <strong>Demo Mode:</strong> This is a demonstration with
                        dummy data.
                    </p>
                </div>
                <a
                    href="https://github.com/harsh8398/parivyaya?tab=readme-ov-file#parivyaya"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-md bg-white/20 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-white/30"
                >
                    <Github className="h-4 w-4" />
                    <span>Run Live App</span>
                </a>
            </div>
        </div>
    );
}
