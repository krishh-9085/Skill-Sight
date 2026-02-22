import type { Route } from "./+types/home";
import ResumeCard from "~/components/ResumeCard";
import { useAppStore } from "~/lib/cloud";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import PageShell from "~/components/PageShell";
import PageHeading from "~/components/PageHeading";
import { useRequireAuth } from "~/hooks/useRequireAuth";
import { ArrowUpRight, FileStack, Sparkles, Target } from "lucide-react";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "SkillSight" },
        { name: "description", content: "Smart feedback for your dream job!" },
    ];
}

export default function Home() {
    const { kv } = useAppStore();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loadingResumes, setLoadingResumes] = useState(false);
    const { isAuthenticated } = useRequireAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            setResumes([]);
            return;
        }

        const loadResumes = async () => {
            setLoadingResumes(true);
            try {
                const resumeItems = (await kv.list('resume:*', true)) as KVItem[] | undefined;
                const parsedResumes = (resumeItems || [])
                    .map((resume) => {
                        try {
                            return JSON.parse(resume.value) as Resume;
                        } catch {
                            return null;
                        }
                    })
                    .filter((resume): resume is Resume => Boolean(resume?.feedback && typeof resume.feedback === "object"));
                setResumes(parsedResumes);
            } finally {
                setLoadingResumes(false);
            }
        };

        loadResumes();
    }, [isAuthenticated, kv]);

    const resumeCount = resumes.length;

    return (
        <PageShell>
            <PageHeading
                kicker="Dashboard"
                title="Build Resume Versions That Beat ATS Filters"
                subtitle={
                    !loadingResumes && resumeCount === 0
                        ? "Start your first analysis to unlock personalized resume feedback."
                        : "Review performance trends, compare submissions, and target the highest-impact edits."
                }
            >
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                   
                    <Link to="/upload" className="primary-button w-fit px-5 py-2.5">
                        <Sparkles className="size-4" aria-hidden="true" />
                        Analyze New Resume
                    </Link>
                </div>
            </PageHeading>

            {loadingResumes && (
                <div className="resumes-section w-full">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="resume-card animate-pulse">
                            <div className="h-5 w-1/2 rounded bg-slate-200" />
                            <div className="h-5 w-2/3 rounded bg-slate-200" />
                            <div className="h-[320px] w-full rounded-xl bg-slate-200" />
                            <div className="h-10 w-full rounded-xl bg-slate-200" />
                        </div>
                    ))}
                </div>
            )}

            {!loadingResumes && resumeCount > 0 && (
                <div className="resumes-section">
                    {resumes.map((resume) => (
                        <ResumeCard key={resume.id} resume={resume} />
                    ))}
                </div>
            )}

            {!loadingResumes && resumeCount === 0 && (
                <div className="empty-panel">
                    <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                        <FileStack className="size-7" aria-hidden="true" />
                    </span>
                    <h3 className="text-2xl font-semibold text-slate-900">Start with your first analysis</h3>
                    <p className="max-w-xl text-slate-600">
                        Upload a resume, paste the job description, and get a full ATS score plus targeted improvement guidance.
                    </p>
                    <div className="mt-4">
                        <Link to="/upload" className="primary-button w-fit text-base font-semibold px-5 py-2.5">
                            Upload Resume
                            <ArrowUpRight className="size-4" aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            )}
        </PageShell>
    );
}
