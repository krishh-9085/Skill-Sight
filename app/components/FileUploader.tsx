import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { formatSize } from '~/lib/utils'
import { AlertTriangle, CheckCircle2, FileText, UploadCloud, X } from "lucide-react";

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
    disabled?: boolean;
}

const FileUploader = ({ onFileSelect, disabled = false }: FileUploaderProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0] || null;
        setSelectedFile(file);
        onFileSelect?.(file);
    }, [onFileSelect]);

    const maxFileSize = 20 * 1024 * 1024;

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        multiple: false,
        accept: { 'application/pdf': ['.pdf'] },
        maxSize: maxFileSize,
        disabled,
    });

    const file = selectedFile;
    const isRejected = fileRejections.length > 0;

    return (
        <>
            <div
                {...getRootProps()}
                className={`w-full rounded-2xl border-2 border-dashed bg-white p-4 transition ${
                    disabled
                        ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-70"
                        : isDragActive
                            ? "cursor-pointer border-sky-400 bg-sky-50/70"
                            : file
                                ? "cursor-pointer border-teal-300 bg-teal-50/40 hover:border-teal-400"
                                : "cursor-pointer border-slate-300 hover:border-sky-300 hover:bg-sky-50/30"
                } ${file ? "flex min-h-[82px] items-center" : "flex min-h-[172px] items-center justify-center"}`}
            >
                <input {...getInputProps()} />

                {file ? (
                    <div className="flex items-center justify-between w-full">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div className="relative flex-shrink-0">
                                <div className="flex size-11 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
                                    <FileText className="size-6" aria-hidden="true" />
                                </div>
                                <CheckCircle2 className="absolute -bottom-1 -right-1 size-5 rounded-full bg-white text-emerald-500" aria-hidden="true" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-base font-semibold text-slate-900">{file.name}</p>
                                <p className="text-sm text-slate-500">{formatSize(file.size)}</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="ml-4 flex size-9 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFile(null);
                                onFileSelect?.(null);
                            }}
                            disabled={disabled}
                            aria-label="Remove file"
                        >
                            <X className="size-4" aria-hidden="true" />
                        </button>
                    </div>
                ) : (
                    <div className="flex w-full flex-col items-center justify-center gap-4 text-center sm:flex-row sm:text-left">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                            <UploadCloud className="size-7" aria-hidden="true" />
                        </div>

                        <div>
                            <p className="text-base font-semibold text-slate-900">
                                {isDragActive ? (
                                    <span className="text-sky-700">Drop your PDF here</span>
                                ) : (
                                    <>
                                        <span>Click to upload</span>
                                        <span className="font-normal text-slate-600"> or drag and drop</span>
                                    </>
                                )}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">PDF only, up to {formatSize(maxFileSize)}</p>
                        </div>
                    </div>
                )}
            </div>

            {isRejected && (
                <div className="alert-error mt-3 flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <p>{fileRejections[0].errors[0].message}</p>
                </div>
            )}
        </>
    )
}

export default FileUploader
