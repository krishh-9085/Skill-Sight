import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import { useEffect, useState } from "react";
import { useAppStore } from "~/lib/cloud";
import { ArrowUpRight, FileText, ScanText } from "lucide-react";

const ResumeCard = ({
                        resume: { id, companyName, jobTitle, feedback, resumePath, imagePath }
                    }: { resume: Resume }) => {
    const { fs } = useAppStore();
    const [previewUrl, setPreviewUrl] = useState("");
    const [isPdfPreview, setIsPdfPreview] = useState(false);

    useEffect(() => {
        let objectUrl = "";
        let cancelled = false;

        const loadResume = async () => {
            const hasFallbackImage = Boolean(imagePath && /-preview\.png$/i.test(imagePath));
            const preferredPath = !imagePath || hasFallbackImage ? resumePath : imagePath;
            let blob = await fs.read(preferredPath);
            let usedPath = preferredPath;

            if (!blob && preferredPath !== resumePath) {
                blob = await fs.read(resumePath);
                usedPath = resumePath;
            } else if (!blob && preferredPath !== imagePath && imagePath) {
                blob = await fs.read(imagePath);
                usedPath = imagePath;
            }

            if (!blob) return;
            objectUrl = URL.createObjectURL(blob);
            if (!cancelled) {
                setPreviewUrl(objectUrl);
                setIsPdfPreview((blob.type || "").includes("pdf") || usedPath.toLowerCase().endsWith(".pdf"));
            }
        };

        loadResume();
        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [fs, imagePath, resumePath]);

    return (
        <Link to={`/resume/${id}`} className="resume-card group">
            <div className="resume-card-header gap-3">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="inline-flex w-fit items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-600">
                        <ScanText className="size-3.5" aria-hidden="true" />
                        ATS Snapshot
                    </span>

                    {companyName ? (
                        <h2 className="break-words text-xl leading-tight font-semibold text-slate-900">{companyName}</h2>
                    ) : (
                        <h2 className="text-xl leading-tight font-semibold text-slate-900">Resume Submission</h2>
                    )}

                    {jobTitle ? (
                        <h3 className="break-words text-base leading-tight text-slate-600">{jobTitle}</h3>
                    ) : (
                        <h3 className="text-sm text-slate-500">No specific role attached</h3>
                    )}
                </div>

                <div className="flex shrink-0 items-start">
                    <ScoreCircle score={feedback.overallScore} size={84} />
                </div>
            </div>

            {previewUrl ? (
                <div className="relative h-[220px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-white/90 bg-white/95 px-2 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-slate-600 shadow-sm">
                        <FileText className="size-3.5" aria-hidden="true" />
                        {isPdfPreview ? "PDF Preview" : "Image Preview"}
                    </span>
                    {isPdfPreview ? (
                        <div className="relative h-full w-full overflow-hidden">
                            <iframe
                                src={`${previewUrl}#page=1&view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
                                title="resume preview"
                                scrolling="no"
                                className="absolute inset-y-0 left-0 h-full w-[calc(100%+18px)] border-0"
                            />
                            <div aria-hidden="true" className="absolute inset-y-0 right-0 w-4 bg-white pointer-events-none" />
                        </div>
                    ) : (
                        <img
                            src={previewUrl}
                            alt="Resume preview"
                            className="h-full w-full object-contain p-2"
                            loading="lazy"
                        />
                    )}
                </div>
            ) : (
                <div className="flex h-[220px] w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500">
                    Loading preview...
                </div>
            )}

            <div className="mt-auto flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-700">
                <span>Open full review</span>
                <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </div>
        </Link>
    );
};

export default ResumeCard;
