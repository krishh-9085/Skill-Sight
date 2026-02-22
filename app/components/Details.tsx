import { cn } from "~/lib/utils";
import { getScoreBand, normalizeScore } from "~/lib/score";
import {
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionItem,
} from "./Accordion";
import { AlertTriangle, BadgeCheck, BookOpenText, LayoutTemplate, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ScoreBadge = ({ score }: { score: number }) => {
    const band = getScoreBand(score);
    const normalizedScore = normalizeScore(score);
    const BadgeIcon = band === "strong" ? BadgeCheck : AlertTriangle;

    return (
        <div
            className={cn(
                "flex items-center gap-1.5 rounded-full border px-2.5 py-1",
                band === "strong"
                    ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                    : band === "medium"
                        ? "border-amber-200 bg-amber-100 text-amber-800"
                        : "border-rose-200 bg-rose-100 text-rose-800"
            )}
        >
            <BadgeIcon className="size-4" aria-hidden="true" />
            <span className="text-sm font-semibold">{normalizedScore}/100</span>
        </div>
    );
};

const CategoryHeader = ({
    title,
    categoryScore,
    Icon,
}: {
    title: string;
    categoryScore: number;
    Icon: LucideIcon;
}) => {
    return (
        <div className="flex w-full items-center justify-between gap-3 py-1">
            <div className="flex items-center gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Icon className="size-5" aria-hidden="true" />
                </span>
                <p className="text-xl font-semibold text-slate-900 sm:text-2xl">{title}</p>
            </div>
            <ScoreBadge score={categoryScore} />
        </div>
    );
};

const CategoryContent = ({
    tips,
}: {
    tips: { type: "good" | "improve"; tip: string; explanation: string }[];
}) => {
    if (tips.length === 0) {
        return (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm text-slate-600">No insights available for this section yet.</p>
            </div>
        );
    }

    return (
        <div className="grid w-full grid-cols-1 gap-3">
            {tips.map((tip, index) => {
                const isGood = tip.type === "good";
                const TipIcon = isGood ? BadgeCheck : AlertTriangle;
                return (
                    <article
                        key={`${tip.tip}-${index}`}
                        className={cn(
                            "rounded-xl border p-4",
                            isGood
                                ? "border-emerald-200 bg-emerald-50"
                                : "border-amber-200 bg-amber-50"
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <TipIcon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                            <div className="min-w-0">
                                <h4
                                    className={cn(
                                        "text-base font-semibold leading-snug sm:text-lg",
                                        isGood ? "text-emerald-900" : "text-amber-900"
                                    )}
                                >
                                    {tip.tip}
                                </h4>
                                <p
                                    className={cn(
                                        "mt-1 text-sm leading-relaxed sm:text-base",
                                        isGood ? "text-emerald-800/90" : "text-amber-800/90"
                                    )}
                                >
                                    {tip.explanation}
                                </p>
                            </div>
                        </div>
                    </article>
                );
            })}
        </div>
    );
};

const Details = ({ feedback }: { feedback: Feedback }) => {
    return (
        <section className="surface-card w-full">
            <div className="mb-3">
                <span className="page-kicker">
                    <BookOpenText className="size-3.5" aria-hidden="true" />
                    Explainability
                </span>
                <h3 className="mt-3 text-xl font-semibold text-slate-900 sm:text-2xl">Detailed Breakdown</h3>
                <p className="mt-1 text-sm text-slate-600">
                    Expand each category to see what is working and what to improve next.
                </p>
            </div>

            <Accordion defaultOpen="tone-style" className="space-y-0">
                <AccordionItem id="tone-style">
                    <AccordionHeader itemId="tone-style">
                        <CategoryHeader
                            title="Tone & Style"
                            categoryScore={feedback.toneAndStyle?.score || 0}
                            Icon={Sparkles}
                        />
                    </AccordionHeader>
                    <AccordionContent itemId="tone-style">
                        <CategoryContent tips={feedback.toneAndStyle?.tips || []} />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem id="content">
                    <AccordionHeader itemId="content">
                        <CategoryHeader
                            title="Content"
                            categoryScore={feedback.content?.score || 0}
                            Icon={BookOpenText}
                        />
                    </AccordionHeader>
                    <AccordionContent itemId="content">
                        <CategoryContent tips={feedback.content?.tips || []} />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem id="structure">
                    <AccordionHeader itemId="structure">
                        <CategoryHeader
                            title="Structure"
                            categoryScore={feedback.structure?.score || 0}
                            Icon={LayoutTemplate}
                        />
                    </AccordionHeader>
                    <AccordionContent itemId="structure">
                        <CategoryContent tips={feedback.structure?.tips || []} />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem id="skills">
                    <AccordionHeader itemId="skills">
                        <CategoryHeader
                            title="Skills"
                            categoryScore={feedback.skills?.score || 0}
                            Icon={Sparkles}
                        />
                    </AccordionHeader>
                    <AccordionContent itemId="skills">
                        <CategoryContent tips={feedback.skills?.tips || []} />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </section>
    );
};

export default Details;
