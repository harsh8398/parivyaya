"use client";

interface UploadFormProps {
    file: File | null;
    uploading: boolean;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export default function UploadForm({
    file,
    uploading,
    onFileChange,
    onSubmit,
}: UploadFormProps) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-slate-800">
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label
                        htmlFor="file-upload"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        Select PDF File
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        accept=".pdf"
                        onChange={onFileChange}
                        className="mt-1 block w-full text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100 dark:text-gray-100 dark:file:bg-indigo-900/40 dark:file:text-indigo-300 dark:hover:file:bg-indigo-900/60"
                    />
                </div>
                <button
                    type="submit"
                    disabled={!file || uploading}
                    className="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                >
                    {uploading ? "Uploading..." : "Upload"}
                </button>
            </form>
        </div>
    );
}
