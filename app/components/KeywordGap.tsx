import { AlertTriangle, CheckCircle2, KeyRound, ListChecks } from "lucide-react";

const KeywordGap = ({ feedback }: { feedback: Feedback }) => {
    const matchedKeywords = feedback.coverage?.matchedKeywords || [];
    const missingKeywords = feedback.coverage?.missingKeywords || [];
    const matchedRequirements = feedback.coverage?.matchedRequirements || [];
    const missingRequirements = feedback.coverage?.missingRequirements || [];

    const totalKeywords = matchedKeywords.length + missingKeywords.length;
    const keywordCoveragePercent =
        totalKeywords > 0 ? Math.round((matchedKeywords.length / totalKeywords) * 100) : 0;
    const hasCoverageData = totalKeywords > 0 || matchedRequirements.length + missingRequirements.length > 0;

    return (
        <section className="surface-card w-full">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <span className="page-kicker">
                        <KeyRound className="size-3.5" aria-hidden="true" />
                        Keyword Gap Analyzer
                    </span>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900 sm:text-2xl">Role Coverage Map</h3>
                    <p className="mt-1 text-sm text-slate-600">
                        See which target role keywords and requirements are covered or missing.
                    </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Coverage</p>
                    <p className="text-2xl font-semibold text-slate-900">{keywordCoveragePercent}%</p>
                </div>
            </div>

            {!hasCoverageData ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600">
                    Keyword coverage data is unavailable for this analysis. Re-analyze this resume to generate gap insights.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                        <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800">
                            <CheckCircle2 className="size-4" aria-hidden="true" />
                            Matched Keywords ({matchedKeywords.length})
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {matchedKeywords.length > 0 ? (
                                matchedKeywords.map((keyword) => (
                                    <span
                                        key={keyword}
                                        className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-700"
                                    >
                                        {keyword}
                                    </span>
                                ))
                            ) : (
                                <p className="text-sm text-emerald-700/80">No matched keywords captured.</p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                        <p className="inline-flex items-center gap-2 text-sm font-semibold text-rose-800">
                            <AlertTriangle className="size-4" aria-hidden="true" />
                            Missing Keywords ({missingKeywords.length})
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {missingKeywords.length > 0 ? (
                                missingKeywords.map((keyword) => (
                                    <span
                                        key={keyword}
                                        className="rounded-full border border-rose-200 bg-white px-2.5 py-1 text-xs font-semibold text-rose-700"
                                    >
                                        {keyword}
                                    </span>
                                ))
                            ) : (
                                <p className="text-sm text-rose-700/80">No high-priority keyword gaps detected.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {hasCoverageData && (
                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
                        <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <ListChecks className="size-4" aria-hidden="true" />
                            Matched Requirements ({matchedRequirements.length})
                        </p>
                        <ul className="mt-3 space-y-2 text-sm text-slate-600">
                            {matchedRequirements.length > 0 ? (
                                matchedRequirements.map((requirement) => (
                                    <li key={requirement} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                        {requirement}
                                    </li>
                                ))
                            ) : (
                                <li className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                    No explicit matched requirements were returned.
                                </li>
                            )}
                        </ul>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
                        <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <AlertTriangle className="size-4" aria-hidden="true" />
                            Missing Requirements ({missingRequirements.length})
                        </p>
                        <ul className="mt-3 space-y-2 text-sm text-slate-600">
                            {missingRequirements.length > 0 ? (
                                missingRequirements.map((requirement) => (
                                    <li key={requirement} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                                        {requirement}
                                    </li>
                                ))
                            ) : (
                                <li className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                                    No major requirement gaps detected.
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            )}
        </section>
    );
};

export default KeywordGap;
