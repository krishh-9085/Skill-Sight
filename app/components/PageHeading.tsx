import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface PageHeadingProps {
    title: string;
    subtitle: string;
    align?: "center" | "left";
    kicker?: string;
    children?: ReactNode;
}

const PageHeading = ({
    title,
    subtitle,
    align = "center",
    kicker,
    children,
}: PageHeadingProps) => {
    return (
        <header
            className={cn(
                "page-heading",
                align === "left" && "items-start text-left"
            )}
        >
            {kicker ? <span className="page-kicker">{kicker}</span> : null}
            <h1 className="text-slate-900">{title}</h1>
            <p className="max-w-3xl text-base text-slate-600 sm:text-lg">{subtitle}</p>
            {children ? <div className="w-full">{children}</div> : null}
        </header>
    );
};

export default PageHeading;
