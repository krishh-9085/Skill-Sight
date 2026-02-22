export type ScoreBand = "strong" | "medium" | "low";

export const normalizeScore = (score: number): number => {
    if (!Number.isFinite(score)) return 0;
    return Math.max(0, Math.min(100, Math.round(score)));
};

export const getScoreBand = (score: number): ScoreBand => {
    const normalized = normalizeScore(score);
    if (normalized >= 70) return "strong";
    if (normalized >= 50) return "medium";
    return "low";
};
