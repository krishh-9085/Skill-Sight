import { getScoreBand } from "~/lib/score";
import { AlertTriangle, BadgeCheck, Gauge } from "lucide-react";
import { cn } from "~/lib/utils";

interface ScoreBadgeProps {
    score: number;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
    const band = getScoreBand(score);
    const badgeColor = {
        strong: "border-emerald-200 bg-emerald-50 text-emerald-700",
        medium: "border-amber-200 bg-amber-50 text-amber-700",
        low: "border-rose-200 bg-rose-50 text-rose-700",
    }[band];
    const badgeText =
        band === "strong"
            ? "Strong"
            : band === "medium"
                ? "Competitive"
                : "Needs Work";
    const BadgeIcon = band === "strong" ? BadgeCheck : band === "medium" ? Gauge : AlertTriangle;

    return (
        <div className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1", badgeColor)}>
            <BadgeIcon className="size-4" aria-hidden="true" />
            <p className="text-sm font-semibold">{badgeText}</p>
        </div>
    );
};

export default ScoreBadge;
