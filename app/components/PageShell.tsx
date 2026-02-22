import type { ReactNode } from "react";
import { Navbar } from "~/components/Navbar";
import { cn } from "~/lib/utils";

interface PageShellProps {
    children: ReactNode;
    showNavbar?: boolean;
    contentClassName?: string;
}

const PageShell = ({
    children,
    showNavbar = true,
    contentClassName,
}: PageShellProps) => {
    return (
        <main className="app-page">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -left-20 top-12 h-56 w-56 rounded-full bg-sky-300/25 blur-3xl sm:h-72 sm:w-72" />
                <div className="absolute -right-16 top-28 h-56 w-56 rounded-full bg-amber-300/20 blur-3xl sm:h-72 sm:w-72" />
                <div className="absolute bottom-[-4.5rem] left-[35%] h-72 w-72 rounded-full bg-teal-300/20 blur-3xl" />
            </div>
            {showNavbar && <Navbar />}
            <section className={cn("main-section relative z-10", contentClassName)}>{children}</section>
        </main>
    );
};

export default PageShell;
