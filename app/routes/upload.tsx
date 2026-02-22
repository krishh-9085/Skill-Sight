import { type FormEvent, useEffect, useState } from 'react'
import FileUploader from "~/components/FileUploader";
import { useAppStore } from "~/lib/cloud";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img";
import { generateUUID } from "~/lib/utils";
import PageShell from "~/components/PageShell";
import PageHeading from "~/components/PageHeading";
import { useRequireAuth } from "~/hooks/useRequireAuth";
import { AlertTriangle, Building2, ClipboardList, LoaderCircle, Sparkles, Target, WandSparkles } from "lucide-react";

const Upload = () => {
    const { fs, ai, kv } = useAppStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [progressValue, setProgressValue] = useState(0);
    const [file, setFile] = useState<File | null>(null);
    const ANALYZE_TIMEOUT_MS = 180000;
    const { isAuthenticated } = useRequireAuth();
    const safeProgress = Math.min(100, Math.max(0, progressValue));

    useEffect(() => {
        if (!isAuthenticated) {
            setFile(null);
            setIsProcessing(false);
            setProgressValue(0);
        }
    }, [isAuthenticated]);

    const handleFileSelect = (selectedFile: File | null) => {
        setFile(selectedFile);
    };

    const updateProgress = (message: string, progress: number) => {
        setStatusText(message);
        setProgressValue(progress);
    };

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File }) => {
        setIsProcessing(true);
        try {
            updateProgress('Uploading the file...', 12);
            const uploadedFile = await fs.upload([file]);
            if (!uploadedFile) {
                setStatusText('Error: Failed to upload file');
                setProgressValue(0);
                setIsProcessing(false);
                return;
            }

            updateProgress('Converting to image...', 30);
            const imageFile = await convertPdfToImage(file);
            if (!imageFile.file) {
                setStatusText('Error: Failed to convert PDF to image');
                setProgressValue(0);
                setIsProcessing(false);
                return;
            }

            updateProgress('Uploading the image...', 48);
            const uploadedImage = await fs.upload([imageFile.file]);
            if (!uploadedImage) {
                setStatusText('Error: Failed to upload image');
                setProgressValue(0);
                setIsProcessing(false);
                return;
            }

            updateProgress('Analyzing...', 66);
            const feedback = await Promise.race([
                ai.feedback(
                    uploadedFile.path,
                    { jobTitle, jobDescription }
                ),
                new Promise<never>((_, reject) =>
                    setTimeout(
                        () =>
                            reject(
                                new Error(
                                    `Analysis timed out after ${Math.round(
                                        ANALYZE_TIMEOUT_MS / 1000
                                    )}s. Check that Ollama is running and retry.`
                                )
                            ),
                        ANALYZE_TIMEOUT_MS
                    )
                ),
            ]);
            if (!feedback) {
                setStatusText('Error: Failed to analyze resume (no response)');
                setIsProcessing(false);
                return;
            }

            const feedbackText = typeof feedback.message.content === 'string'
                ? feedback.message.content
                : '';
            if (!feedbackText) {
                throw new Error("Invalid analysis payload received from API.");
            }

            const parsedFeedback = JSON.parse(feedbackText) as Feedback;
            updateProgress('Preparing your report...', 84);
            const uuid = generateUUID();
            const data = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName,
                jobTitle,
                jobDescription,
                feedback: parsedFeedback,
            };

            const saved = await kv.set(`resume:${uuid}`, JSON.stringify(data));
            if (!saved) {
                throw new Error("Failed to save analysis result.");
            }
            updateProgress('Analysis complete, redirecting...', 100);
            navigate(`/resume/${uuid}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to process analysis response';
            console.error('[SkillSight:upload] analyze flow failed', {
                message,
                stack: error instanceof Error ? error.stack : undefined,
                fileName: file.name,
                companyName,
                jobTitle,
            });
            setStatusText(`Error: ${message}`);
            setProgressValue(0);
            setIsProcessing(false);
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const companyName = (formData.get('company-name') as string) || '';
        const jobTitle = (formData.get('job-title') as string) || '';
        const jobDescription = (formData.get('job-description') as string) || '';

        if (!file) {
            setStatusText('Error: Please upload a PDF resume before analyzing');
            setProgressValue(0);
            return;
        }
        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    };

    return (
        <PageShell>
            <PageHeading
                kicker="Analyzer"
                title="Match Your Resume to the Role"
                subtitle={
                    isProcessing
                        ? statusText || "Analyzing your resume..."
                        : "Upload your resume and role details to get ATS scoring and practical improvement guidance."
                }
                align="left"
            />

            <div className="grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[1.45fr_1fr]">
                <div className="surface-card w-full">
                    {isProcessing && (
                        <div className="alert-info mb-5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="inline-flex items-center gap-2">
                                    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                                    <span>{statusText || "Analyzing your resume..."}</span>
                                </p>
                                <span className="text-xs font-semibold uppercase tracking-[0.08em]">
                                    {safeProgress}%
                                </span>
                            </div>
                            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 transition-[width] duration-300 ease-out"
                                    style={{ width: `${safeProgress}%` }}
                                />
                            </div>
                        </div>
                    )}
                    {!isProcessing && statusText.startsWith('Error:') && (
                        <div className="alert-error mb-5 flex items-center gap-2">
                            <AlertTriangle className="size-4" aria-hidden="true" />
                            <span>{statusText}</span>
                        </div>
                    )}

                    <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="form-div">
                                <label htmlFor="company-name" className="inline-flex items-center gap-2">
                                    <Building2 className="size-4 text-slate-500" aria-hidden="true" />
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    name="company-name"
                                    id="company-name"
                                    placeholder="Ex: Acme Labs"
                                    disabled={isProcessing}
                                />
                            </div>

                            <div className="form-div">
                                <label htmlFor="job-title" className="inline-flex items-center gap-2">
                                    <Target className="size-4 text-slate-500" aria-hidden="true" />
                                    Job Title
                                </label>
                                <input
                                    type="text"
                                    name="job-title"
                                    id="job-title"
                                    placeholder="Ex: Frontend Engineer"
                                    disabled={isProcessing}
                                />
                            </div>
                        </div>

                        <div className="form-div">
                            <label htmlFor="job-description" className="inline-flex items-center gap-2">
                                <ClipboardList className="size-4 text-slate-500" aria-hidden="true" />
                                Job Description
                            </label>
                            <textarea
                                rows={8}
                                name="job-description"
                                id="job-description"
                                placeholder="Paste the role description and requirements here..."
                                disabled={isProcessing}
                            />
                        </div>

                        <div className="form-div">
                            <label htmlFor="uploader">Upload Resume (PDF)</label>
                            <FileUploader onFileSelect={handleFileSelect} disabled={isProcessing} />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <p className="muted-copy">
                                Role-specific descriptions produce the best matching accuracy.
                            </p>
                            <button className="primary-button w-full px-6 py-2.5 sm:w-fit" type="submit" disabled={isProcessing}>
                                {isProcessing ? (
                                    <>
                                        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <WandSparkles className="size-4" aria-hidden="true" />
                                        Analyze Resume
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <aside className="surface-card h-fit lg:sticky lg:top-28">
                    <h2 className="text-2xl font-semibold text-slate-900">How to get stronger results</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Quality inputs lead to more precise scoring and clearer next-step recommendations.
                    </p>

                    <div className="mt-5 space-y-3">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                            <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <Sparkles className="size-4 text-sky-600" aria-hidden="true" />
                                Tailor the resume to one role
                            </p>
                            <p className="mt-2 text-sm text-slate-600">
                                Analyze one target job per resume version for clearer keyword and content feedback.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                            <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <Target className="size-4 text-teal-600" aria-hidden="true" />
                                Include responsibilities and must-have skills
                            </p>
                            <p className="mt-2 text-sm text-slate-600">
                                The analyzer compares your content directly against the role requirements you provide.
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </PageShell>
    )
}

export default Upload
