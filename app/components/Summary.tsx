import ScoreGauge from "~/components/ScoreGauge";
import ScoreBadge from "~/components/ScoreBadge";
import { getScoreBand, normalizeScore } from "~/lib/score";
import { cn } from "~/lib/utils";
import { FilePenLine, LayoutTemplate, MessageSquareText, Sparkles, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const scoreToneClasses = (score: number) => {
    const band = getScoreBand(score);
    return {
        value:
            band === "strong"
                ? "text-emerald-700"
                : band === "medium"
                    ? "text-amber-700"
                    : "text-rose-700",
        bar:
            band === "strong"
                ? "bg-emerald-500"
                : band === "medium"
                    ? "bg-amber-500"
                    : "bg-rose-500",
    };
};

const CategoryRow = ({
    title,
    score,
    description,
    Icon,
}: {
    title: string;
    score: number;
    description: string;
    Icon: LucideIcon;
}) => {
    const normalizedScore = normalizeScore(score);
    const tones = scoreToneClasses(score);

    return (
        <article className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-[0_12px_24px_-24px_rgba(15,41,64,0.95)]">
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
                        <p className="mt-1 text-sm text-slate-600">{description}</p>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <ScoreBadge score={normalizedScore} />
                </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
                <p className={cn("text-2xl font-semibold leading-none", tones.value)}>
                    {normalizedScore}
                    <span className="text-lg font-medium text-slate-500">/100</span>
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Category score</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                    className={cn("h-full rounded-full transition-all duration-300", tones.bar)}
                    style={{ width: `${normalizedScore}%` }}
                />
            </div>
        </article>
    );
};

const Summary = ({ feedback }: { feedback: Feedback }) => {
    const overall = normalizeScore(feedback.overallScore || 0);
    const overallBand = getScoreBand(overall);
    const headline =
        overallBand === "strong"
            ? "Your resume is highly competitive for ATS screening."
            : overallBand === "medium"
                ? "You are close. A few targeted edits can lift your hit rate."
                : "Important optimization opportunities were found in your resume.";

    const categories = [
        {
            title: "Tone & Style",
            score: feedback.toneAndStyle?.score || 0,
            description: "Professional clarity and impact of your wording.",
            Icon: MessageSquareText,
        },
        {
            title: "Content",
            score: feedback.content?.score || 0,
            description: "Relevance and strength of achievements and details.",
            Icon: FilePenLine,
        },
        {
            title: "Structure",
            score: feedback.structure?.score || 0,
            description: "Layout readability and resume organization quality.",
            Icon: LayoutTemplate,
        },
        {
            title: "Skills",
            score: feedback.skills?.score || 0,
            description: "Role-specific skills alignment and keyword depth.",
            Icon: Wrench,
        },
    ];

    return (
        <section className="surface-card w-full overflow-hidden">
            <div className="grid grid-cols-1 items-center gap-5 sm:grid-cols-[auto,1fr]">
                <div className="justify-self-center sm:justify-self-start">
                    <ScoreGauge score={overall} />
                </div>
                <div>
                    <span className="page-kicker">
                        <Sparkles className="size-3.5" aria-hidden="true" />
                        Overall Performance
                    </span>
                    <h2 className="mt-3 text-3xl font-semibold text-slate-900">Your Resume Score</h2>
                    <p className="mt-2 text-sm text-slate-600 sm:text-base">
                        {headline}
                    </p>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
                {categories.map((category) => (
                    <CategoryRow
                        key={category.title}
                        title={category.title}
                        score={category.score}
                        description={category.description}
                        Icon={category.Icon}
                    />
                ))}
            </div>
        </section>
    );
};

export default Summary;
