import { cn } from "~/lib/utils";
import { getScoreBand, normalizeScore } from "~/lib/score";
import {
    AlertTriangle,
    CheckCircle2,
    ClipboardCheck,
    ShieldAlert,
    ShieldCheck,
    ShieldQuestion,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Suggestion {
    type: "good" | "improve";
    tip: string;
}

interface ATSProps {
    score: number;
    suggestions: Suggestion[];
}

const ATS = ({ score, suggestions }: ATSProps) => {
    const normalizedScore = normalizeScore(score);
    const band = getScoreBand(score);
    const palette =
        band === "strong"
            ? {
                card: "from-emerald-50/90 via-white to-teal-50/70",
                headline: "text-emerald-800",
                scorePill: "border-emerald-200 bg-emerald-100 text-emerald-800",
                topBar: "from-emerald-400 to-teal-400",
                iconBg: "bg-emerald-100 text-emerald-700",
                title: "Strong ATS Alignment",
                AccentIcon: ShieldCheck,
            }
            : band === "medium"
                ? {
                    card: "from-amber-50/90 via-white to-orange-50/70",
                    headline: "text-amber-800",
                    scorePill: "border-amber-200 bg-amber-100 text-amber-800",
                    topBar: "from-amber-400 to-orange-400",
                    iconBg: "bg-amber-100 text-amber-700",
                    title: "Good ATS Foundation",
                    AccentIcon: ShieldQuestion,
                }
                : {
                    card: "from-rose-50/90 via-white to-orange-50/70",
                    headline: "text-rose-800",
                    scorePill: "border-rose-200 bg-rose-100 text-rose-800",
                    topBar: "from-rose-400 to-orange-400",
                    iconBg: "bg-rose-100 text-rose-700",
                    title: "ATS Needs Work",
                    AccentIcon: ShieldAlert,
                };

    const displaySuggestions =
        suggestions.length > 0
            ? suggestions
            : [{ type: "improve", tip: "Add more role-specific keywords from the job description." }];
    const AccentIcon = palette.AccentIcon as LucideIcon;

    return (
        <section className={cn("surface-card relative w-full overflow-hidden bg-gradient-to-br", palette.card)}>
            <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", palette.topBar)} />

            <header className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className={cn("flex size-12 items-center justify-center rounded-xl", palette.iconBg)}>
                        <AccentIcon className="size-7" aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">ATS Match</p>
                        <h3 className={cn("text-xl font-semibold sm:text-2xl", palette.headline)}>{palette.title}</h3>
                    </div>
                </div>

                <div className={cn("min-w-[132px] rounded-xl border px-3 py-2 text-right", palette.scorePill)}>
                    <p className="text-xs font-medium uppercase tracking-wide opacity-80">Score</p>
                    <p className="text-2xl font-semibold leading-none">
                        {normalizedScore}
                        <span className="text-base">/100</span>
                    </p>
                </div>
            </header>

            <p className="mt-4 text-sm text-slate-700 sm:text-base">
                This indicates how well your resume is likely to pass Applicant Tracking System filters before recruiter review.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3">
                {displaySuggestions.map((suggestion, index) => {
                    const isGood = suggestion.type === "good";
                    const SuggestionIcon = isGood ? CheckCircle2 : AlertTriangle;
                    return (
                        <div
                            key={`${suggestion.tip}-${index}`}
                            className={cn(
                                "flex items-start gap-3 rounded-xl border px-4 py-3",
                                isGood
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                                    : "border-amber-200 bg-amber-50 text-amber-900"
                            )}
                        >
                            <SuggestionIcon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                            <p className="text-sm leading-relaxed sm:text-base">{suggestion.tip}</p>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
                <ClipboardCheck className="size-3.5" aria-hidden="true" />
                Automated ATS inspection complete
            </div>
        </section>
    );
};

export default ATS;
