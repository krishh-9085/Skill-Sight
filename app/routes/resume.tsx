import { Link, useParams } from "react-router";
import { useEffect, useState } from "react";
import { useAppStore } from "~/lib/cloud";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import KeywordGap from "~/components/KeywordGap";
import ActionPlan from "~/components/ActionPlan";
import PageShell from "~/components/PageShell";
import { useRequireAuth } from "~/hooks/useRequireAuth";
import {
    ArrowLeft,
    BriefcaseBusiness,
    Building2,
    ExternalLink,
    FileSearch,
    KeyRound,
    ListChecks,
    LoaderCircle,
    TextSearch,
} from "lucide-react";
import { cn } from "~/lib/utils";

export const meta = () => ([
    { title: 'SkillSight | Review' },
    { name: 'description', content: 'Detailed overview of your resume' },
]);

const Resume = () => {
    const { fs, kv } = useAppStore();
    const { id } = useParams();
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [isFeedbackLoading, setIsFeedbackLoading] = useState(true);
    const [meta, setMeta] = useState<{ companyName?: string; jobTitle?: string } | null>(null);
    const [activePanel, setActivePanel] = useState<"keywords" | "plan" | "details">("keywords");
    const { isAuthenticated } = useRequireAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            setResumeUrl("");
            setFeedback(null);
            setMeta(null);
            setIsFeedbackLoading(false);
            return;
        }

        let objectUrl = "";
        let cancelled = false;

        const loadResume = async () => {
            setIsFeedbackLoading(true);
            try {
                const resume = await kv.get(`resume:${id}`);
                if (!resume) {
                    if (!cancelled) {
                        setFeedback(null);
                        setResumeUrl("");
                    }
                    return;
                }

                const data = JSON.parse(resume);
                if (!cancelled) {
                    setMeta({
                        companyName: data.companyName,
                        jobTitle: data.jobTitle,
                    });
                }

                const resumeBlob = await fs.read(data.resumePath);
                if (resumeBlob) {
                    const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
                    objectUrl = URL.createObjectURL(pdfBlob);
                    if (!cancelled) setResumeUrl(objectUrl);
                }

                if (data.feedback && typeof data.feedback === 'object') {
                    if (!cancelled) setFeedback(data.feedback);
                } else {
                    if (!cancelled) setFeedback(null);
                }
            } finally {
                if (!cancelled) setIsFeedbackLoading(false);
            }
        };

        loadResume();

        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [fs, id, isAuthenticated, kv]);

    return (
        <PageShell contentClassName="items-stretch">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
                <div className="surface-card flex flex-wrap items-center justify-between gap-3">
                    <Link to="/" className="secondary-button w-fit">
                        <ArrowLeft className="size-4" aria-hidden="true" />
                        Back to Dashboard
                    </Link>
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                        {meta?.companyName ? (
                            <span className="status-chip">
                                <Building2 className="size-3.5" aria-hidden="true" />
                                {meta.companyName}
                            </span>
                        ) : null}
                        {meta?.jobTitle ? (
                            <span className="status-chip">
                                <BriefcaseBusiness className="size-3.5" aria-hidden="true" />
                                {meta.jobTitle}
                            </span>
                        ) : null}
                        {resumeUrl ? (
                            <a
                                href={resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="secondary-button w-fit"
                            >
                                <ExternalLink className="size-4" aria-hidden="true" />
                                Open PDF
                            </a>
                        ) : null}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                    <section className="feedback-section">
                        <div className="surface-card p-4 sm:p-5">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <h2 className="text-2xl font-semibold text-slate-900">Resume Preview</h2>
                                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
                                    <FileSearch className="size-3.5" aria-hidden="true" />
                                    Source file
                                </span>
                            </div>
                            {resumeUrl ? (
                                <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                    <div className="h-[70vh] min-h-[460px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                        <div className="relative w-full h-full overflow-hidden">
                                            <iframe
                                                src={`${resumeUrl}#page=1&view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
                                                title="resume"
                                                scrolling="no"
                                                className="absolute inset-y-0 left-0 h-full w-[calc(100%+18px)] border-0"
                                            />
                                            <div aria-hidden="true" className="absolute inset-y-0 right-0 w-4 bg-white pointer-events-none" />
                                        </div>
                                    </div>
                                </a>
                            ) : (
                                <div className="flex min-h-[340px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600">
                                    <LoaderCircle className="mr-2 size-4 animate-spin" aria-hidden="true" />
                                    Loading resume preview...
                                </div>
                            )}
                        </div>

                        {feedback ? (
                            <>
                                <div className="surface-card p-3 sm:p-4">
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                        <button
                                            type="button"
                                            onClick={() => setActivePanel("keywords")}
                                            className={cn(
                                                "secondary-button w-full justify-center",
                                                activePanel === "keywords" && "border-sky-300 bg-sky-50 text-sky-800"
                                            )}
                                        >
                                            <KeyRound className="size-4" aria-hidden="true" />
                                            Keywords
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActivePanel("plan")}
                                            className={cn(
                                                "secondary-button w-full justify-center",
                                                activePanel === "plan" && "border-sky-300 bg-sky-50 text-sky-800"
                                            )}
                                        >
                                            <ListChecks className="size-4" aria-hidden="true" />
                                            Fix First
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActivePanel("details")}
                                            className={cn(
                                                "secondary-button w-full justify-center",
                                                activePanel === "details" && "border-sky-300 bg-sky-50 text-sky-800"
                                            )}
                                        >
                                            <TextSearch className="size-4" aria-hidden="true" />
                                            Breakdown
                                        </button>
                                    </div>
                                </div>

                                {activePanel === "keywords" ? <KeywordGap feedback={feedback} /> : null}
                                {activePanel === "plan" ? <ActionPlan feedback={feedback} resumeId={id || "resume"} /> : null}
                                {activePanel === "details" ? <Details feedback={feedback} /> : null}
                            </>
                        ) : null}
                    </section>

                    <section className="feedback-section">
                        {feedback ? (
                            <>
                                <Summary feedback={feedback} />
                                <ATS score={feedback.ATS?.score || 0} suggestions={feedback.ATS?.tips || []} />
                            </>
                        ) : isFeedbackLoading ? (
                            <div className="surface-card flex min-h-[180px] items-center justify-center text-slate-600">
                                <LoaderCircle className="mr-2 size-4 animate-spin" aria-hidden="true" />
                                Loading feedback...
                            </div>
                        ) : (
                            <div className="surface-card min-h-[180px] text-slate-600">
                                Feedback is not available for this resume.
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </PageShell>
    );
};

export default Resume;
