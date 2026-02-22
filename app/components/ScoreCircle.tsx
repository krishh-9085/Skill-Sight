import { useId } from "react";
import { getScoreBand, normalizeScore } from "~/lib/score";

const ScoreCircle = ({ score = 75, size = 96 }: { score: number; size?: number }) => {
    const gradientId = useId().replace(/:/g, "-");
    const normalizedScore = normalizeScore(score);
    const band = getScoreBand(score);
    const radius = 40;
    const stroke = 8;
    const normalizedRadius = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const progress = normalizedScore / 100;
    const strokeDashoffset = circumference * (1 - progress);
    const dimension = `${Math.max(64, size)}px`;
    const tones =
        band === "strong"
            ? { start: "#10b981", end: "#14b8a6", trail: "#ccfbf1", text: "text-emerald-700" }
            : band === "medium"
                ? { start: "#f59e0b", end: "#fb923c", trail: "#fef3c7", text: "text-amber-700" }
                : { start: "#f97316", end: "#ef4444", trail: "#ffe4e6", text: "text-rose-700" };

    return (
        <div className="relative shrink-0" style={{ width: dimension, height: dimension }}>
            <svg
                height="100%"
                width="100%"
                viewBox="0 0 100 100"
                className="transform -rotate-90"
            >
                <circle
                    cx="50"
                    cy="50"
                    r={normalizedRadius}
                    stroke={tones.trail}
                    strokeWidth={stroke}
                    fill="transparent"
                />
                <defs>
                    <linearGradient id={gradientId} x1="1" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={tones.start} />
                        <stop offset="100%" stopColor={tones.end} />
                    </linearGradient>
                </defs>
                <circle
                    cx="50"
                    cy="50"
                    r={normalizedRadius}
                    stroke={`url(#${gradientId})`}
                    strokeWidth={stroke}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-base font-bold ${tones.text}`}>{normalizedScore}</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">score</span>
            </div>
        </div>
    );
};

export default ScoreCircle;
