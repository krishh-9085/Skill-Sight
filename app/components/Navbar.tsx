import { Link, NavLink, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useAppStore } from "~/lib/cloud";
import {
    AlertTriangle,
    LoaderCircle,
    Menu,
    Home,
    LogIn,
    LogOut,
    MoonStar,
    Sparkles,
    SunMedium,
    Upload,
    X,
} from "lucide-react";
import { useTheme } from "~/hooks/useTheme";
import { cn } from "~/lib/utils";

export const Navbar = () => {
    const { auth } = useAppStore();
    const navigate = useNavigate();
    const location = useLocation();
    const { isDark, toggleTheme } = useTheme();
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!isLogoutDialogOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !isLoggingOut) {
                setIsLogoutDialogOpen(false);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isLogoutDialogOpen, isLoggingOut]);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname, location.search]);

    const handleLogoutConfirm = async () => {
        setIsLoggingOut(true);
        await auth.signOut();
        setIsLoggingOut(false);
        setIsLogoutDialogOpen(false);
        setIsMobileMenuOpen(false);
        navigate("/auth?next=/");
    };

    return (
        <>
            <nav className="navbar">
                <div className="flex w-full items-center justify-between sm:w-auto">
                    <Link to="/" className="flex min-w-0 items-center gap-3 rounded-xl px-1 py-1">
                        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 text-white shadow-[0_12px_22px_-14px_rgba(2,132,199,0.9)]">
                            <Sparkles className="size-5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                            <span className="block text-3xl font-bold leading-none text-slate-900">SkillSight</span>
                        </span>
                    </Link>

                    <div className="flex items-center gap-2 sm:hidden">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="theme-toggle"
                            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
                            title={`Switch to ${isDark ? "light" : "dark"} mode`}
                        >
                            {isDark ? (
                                <SunMedium className="size-4" aria-hidden="true" />
                            ) : (
                                <MoonStar className="size-4" aria-hidden="true" />
                            )}
                        </button>
                        <button
                            type="button"
                            className="theme-toggle"
                            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                        >
                            {isMobileMenuOpen ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
                        </button>
                    </div>
                </div>

                <div
                    className={cn(
                        "w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-2 sm:flex-nowrap",
                        isMobileMenuOpen ? "flex" : "hidden sm:flex"
                    )}
                >
                    <div className="nav-strip">
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) => cn("nav-pill", isActive && "nav-pill-active")}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <Home className="size-4" aria-hidden="true" />
                            Dashboard
                        </NavLink>
                        <NavLink
                            to="/upload"
                            className={({ isActive }) => cn("nav-pill", isActive && "nav-pill-active")}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <Upload className="size-4" aria-hidden="true" />
                            Upload
                        </NavLink>
                    </div>

                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="theme-toggle hidden sm:inline-flex"
                        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
                        title={`Switch to ${isDark ? "light" : "dark"} mode`}
                    >
                        {isDark ? (
                            <SunMedium className="size-4" aria-hidden="true" />
                        ) : (
                            <MoonStar className="size-4" aria-hidden="true" />
                        )}
                    </button>

                    {!auth.isAuthenticated && (
                        <Link to="/auth?next=/" className="secondary-button w-full sm:w-fit" onClick={() => setIsMobileMenuOpen(false)}>
                            <LogIn className="size-4" aria-hidden="true" />
                            Sign In
                        </Link>
                    )}
                    {auth.isAuthenticated && (
                        <button
                            onClick={() => {
                                setIsLogoutDialogOpen(true);
                                setIsMobileMenuOpen(false);
                            }}
                            className="secondary-button w-full sm:w-fit"
                        >
                            <LogOut className="size-4" aria-hidden="true" />
                            Log out
                        </button>
                    )}
                </div>
            </nav>

            {isLogoutDialogOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
                    onClick={() => {
                        if (!isLoggingOut) setIsLogoutDialogOpen(false);
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="logout-dialog-title"
                        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_28px_50px_-34px_rgba(15,41,64,0.9)]"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start gap-3">
                            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                                <AlertTriangle className="size-5" aria-hidden="true" />
                            </span>
                            <div>
                                <h3 id="logout-dialog-title" className="text-xl font-semibold text-slate-900">
                                    Log out now?
                                </h3>
                                <p className="mt-1 text-sm text-slate-600">
                                    You can sign back in anytime to continue from your dashboard.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                className="secondary-button w-fit"
                                onClick={() => setIsLogoutDialogOpen(false)}
                                disabled={isLoggingOut}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="primary-button w-fit"
                                onClick={handleLogoutConfirm}
                                disabled={isLoggingOut}
                            >
                                {isLoggingOut ? (
                                    <>
                                        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                                        Logging out...
                                    </>
                                ) : (
                                    <>
                                        <LogOut className="size-4" aria-hidden="true" />
                                        Log out
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
