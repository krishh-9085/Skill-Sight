import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CircleCheckBig, ClipboardList, FlagTriangleRight } from "lucide-react";
import { cn } from "~/lib/utils";

type Priority = "high" | "medium" | "low";

type PlanItem = {
    id: string;
    category: string;
    title: string;
    detail: string;
    priority: Priority;
    score: number;
};

const PRIORITY_ORDER: Record<Priority, number> = {
    high: 0,
    medium: 1,
    low: 2,
};

const getPriorityFromScore = (score: number): Priority => {
    if (score < 55) return "high";
    if (score < 72) return "medium";
    return "low";
};

const ActionPlan = ({ feedback, resumeId }: { feedback: Feedback; resumeId: string }) => {
    const plan = useMemo<PlanItem[]>(() => {
        const list: PlanItem[] = [];
        const pushItems = (
            category: string,
            score: number,
            tips: { type: "good" | "improve"; tip: string; explanation?: string }[]
        ) => {
            tips
                .filter((tip) => tip.type === "improve")
                .forEach((tip, index) => {
                    list.push({
                        id: `${category}-${index}-${tip.tip}`.toLowerCase().replace(/\s+/g, "-"),
                        category,
                        title: tip.tip,
                        detail: tip.explanation || "Improve this area to strengthen ATS alignment.",
                        priority: getPriorityFromScore(score),
                        score,
                    });
                });
        };

        pushItems("ATS", feedback.ATS?.score || 0, feedback.ATS?.tips || []);
        pushItems("Tone & Style", feedback.toneAndStyle?.score || 0, feedback.toneAndStyle?.tips || []);
        pushItems("Content", feedback.content?.score || 0, feedback.content?.tips || []);
        pushItems("Structure", feedback.structure?.score || 0, feedback.structure?.tips || []);
        pushItems("Skills", feedback.skills?.score || 0, feedback.skills?.tips || []);

        return list
            .sort((a, b) => {
                const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
                if (priorityDiff !== 0) return priorityDiff;
                return a.score - b.score;
            })
            .slice(0, 10);
    }, [feedback]);

    const storageKey = `skillsight-action-plan-${resumeId}`;
    const [doneMap, setDoneMap] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (typeof window === "undefined") return;
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) {
            setDoneMap({});
            return;
        }
        try {
            const parsed = JSON.parse(raw) as Record<string, boolean>;
            setDoneMap(parsed || {});
        } catch {
            setDoneMap({});
        }
    }, [storageKey]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        window.localStorage.setItem(storageKey, JSON.stringify(doneMap));
    }, [doneMap, storageKey]);

    const completedCount = plan.filter((item) => doneMap[item.id]).length;
    const progressPercent = plan.length > 0 ? Math.round((completedCount / plan.length) * 100) : 0;

    const toggleItem = (id: string) => {
        setDoneMap((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    return (
        <section className="surface-card w-full">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <span className="page-kicker">
                        <ClipboardList className="size-3.5" aria-hidden="true" />
                        Top Fixes
                    </span>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900 sm:text-2xl">What To Fix First</h3>
                    <p className="mt-1 text-sm text-slate-600">
                        This turns scattered feedback into one ordered checklist so you can improve score faster.
                    </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Progress</p>
                    <p className="text-2xl font-semibold text-slate-900">{progressPercent}%</p>
                </div>
            </div>

            {plan.length === 0 ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
                    No immediate improvement tasks found. Your analysis currently shows strong coverage.
                </div>
            ) : (
                <div className="space-y-3">
                    {plan.map((item) => {
                        const done = Boolean(doneMap[item.id]);
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => toggleItem(item.id)}
                                className={cn(
                                    "w-full rounded-2xl border px-4 py-3 text-left transition",
                                    done
                                        ? "border-emerald-200 bg-emerald-50/90"
                                        : "border-slate-200 bg-white/90 hover:bg-slate-50"
                                )}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-start gap-3">
                                        {done ? (
                                            <CircleCheckBig className="mt-0.5 size-5 shrink-0 text-emerald-700" aria-hidden="true" />
                                        ) : (
                                            <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-700" aria-hidden="true" />
                                        )}
                                        <div className="min-w-0">
                                            <p className={cn("font-semibold", done ? "text-emerald-900 line-through" : "text-slate-900")}>
                                                {item.title}
                                            </p>
                                            <p className={cn("mt-1 text-sm", done ? "text-emerald-800/90" : "text-slate-600")}>
                                                {item.detail}
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={cn(
                                            "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em]",
                                            item.priority === "high"
                                                ? "border-rose-200 bg-rose-50 text-rose-700"
                                                : item.priority === "medium"
                                                    ? "border-amber-200 bg-amber-50 text-amber-700"
                                                    : "border-sky-200 bg-sky-50 text-sky-700"
                                        )}
                                    >
                                        <FlagTriangleRight className="size-3.5" aria-hidden="true" />
                                        {item.priority}
                                    </span>
                                </div>
                                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.09em] text-slate-500">
                                    {item.category} score: {item.score}/100
                                </p>
                            </button>
                        );
                    })}
                </div>
            )}
        </section>
    );
};

export default ActionPlan;
