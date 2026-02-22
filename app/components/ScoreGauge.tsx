import { useEffect, useId, useRef, useState } from "react";
import { getScoreBand, normalizeScore } from "~/lib/score";
import { cn } from "~/lib/utils";

const ScoreGauge = ({ score = 75 }: { score: number }) => {
    const gradientId = useId().replace(/:/g, "-");
    const [pathLength, setPathLength] = useState(0);
    const pathRef = useRef<SVGPathElement>(null);
    const normalizedScore = normalizeScore(score);
    const band = getScoreBand(score);

    const percentage = normalizedScore / 100;
    const gradientStops =
        band === "strong"
            ? { start: "#14b8a6", end: "#06b6d4", text: "text-teal-700", label: "Strong Match" }
            : band === "medium"
                ? { start: "#f59e0b", end: "#fb923c", text: "text-amber-700", label: "Decent Match" }
                : { start: "#f97316", end: "#ef4444", text: "text-rose-700", label: "Needs Work" };

    useEffect(() => {
        if (pathRef.current) {
            setPathLength(pathRef.current.getTotalLength());
        }
    }, []);

    return (
        <div className="flex flex-col items-center">
            <div className="relative h-28 w-52">
                <svg viewBox="0 0 100 50" className="h-full w-full">
                    <defs>
                        <linearGradient
                            id={gradientId}
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                        >
                            <stop offset="0%" stopColor={gradientStops.start} />
                            <stop offset="100%" stopColor={gradientStops.end} />
                        </linearGradient>
                    </defs>

                    <path
                        d="M10,50 A40,40 0 0,1 90,50"
                        fill="none"
                        stroke="#d9e8f2"
                        strokeWidth="10"
                        strokeLinecap="round"
                    />

                    <path
                        ref={pathRef}
                        d="M10,50 A40,40 0 0,1 90,50"
                        fill="none"
                        stroke={`url(#${gradientId})`}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={pathLength}
                        strokeDashoffset={pathLength * (1 - percentage)}
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center pt-15">
                    <div className={cn("text-3xl font-bold leading-none", gradientStops.text)}>{normalizedScore}</div>
                    <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.11em] text-slate-500">
                        {gradientStops.label}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScoreGauge;
