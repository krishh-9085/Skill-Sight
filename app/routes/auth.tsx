import { type FormEvent, useEffect, useState } from "react";
import { useAppStore } from "~/lib/cloud";
import { Link, useLocation, useNavigate } from "react-router";
import { LoaderCircle, LockKeyhole, Sparkles, UserPlus } from "lucide-react";

export const meta = () => ([
    { title: "SkillSight | Auth" },
    { name: "description", content: "Log into your account" },
]);

const Auth = () => {
    const { isLoading, error, clearError, auth } = useAppStore();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const next = searchParams.get("next") || "/";
    const navigate = useNavigate();

    const [mode, setMode] = useState<"sign_in" | "sign_up">("sign_in");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (auth.isAuthenticated && next) {
            navigate(decodeURIComponent(next));
        }
    }, [auth.isAuthenticated, next, navigate]);

    useEffect(() => {
        if (error) {
            const timeout = setTimeout(() => {
                clearError();
            }, 6000);
            return () => clearTimeout(timeout);
        }
        return undefined;
    }, [clearError, error]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        clearError();
        setSubmitting(true);
        try {
            await auth.signIn({
                email,
                password,
                mode,
            });
        } finally {
            setSubmitting(false);
        }
    };

    const isBusy = isLoading || submitting;

    return (
        <main className="app-page flex items-center justify-center py-8 sm:py-12">
            <div className="auth-shell">
                <aside className="auth-aside">
                    <div>
                        <span className="inline-flex size-12 items-center justify-center rounded-xl bg-white/20">
                            <Sparkles className="size-6" aria-hidden="true" />
                        </span>
                        <h1 className="mt-5 text-4xl font-semibold text-white">SkillSight</h1>
                        <p className="mt-3 text-sm text-white/90">
                            Securely analyze resumes, compare scores, and track improvement over time.
                        </p>
                    </div>
                    <div className="space-y-3 text-sm text-white/90">
                        <p className="rounded-xl border border-white/25 bg-white/10 px-4 py-3">
                            ATS scoring with actionable category-level feedback.
                        </p>
                        <p className="rounded-xl border border-white/25 bg-white/10 px-4 py-3">
                            Private storage tied to your own authenticated account.
                        </p>
                    </div>
                </aside>

                <section className="p-6 sm:p-8">
                    <span className="page-kicker">
                        <LockKeyhole className="size-3.5" aria-hidden="true" />
                        Secure Access
                    </span>
                    <h2 className="mt-4 text-3xl font-semibold text-slate-900">Welcome Back</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        {mode === "sign_in"
                            ? "Sign in to continue to your dashboard."
                            : "Create an account to store your resume analyses."}
                    </p>

                    {!auth.isAuthenticated && (
                        <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1">
                            <button
                                type="button"
                                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${mode === "sign_in"
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-600 hover:text-slate-900"}`}
                                onClick={() => setMode("sign_in")}
                                disabled={isBusy}
                            >
                                Sign In
                            </button>
                            <button
                                type="button"
                                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${mode === "sign_up"
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-600 hover:text-slate-900"}`}
                                onClick={() => setMode("sign_up")}
                                disabled={isBusy}
                            >
                                Sign Up
                            </button>
                        </div>
                    )}

                    {isBusy ? (
                        <div className="alert-info mt-4 flex items-center gap-2">
                            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                            Authenticating...
                        </div>
                    ) : null}

                    {auth.isAuthenticated ? (
                        <div className="mt-5 space-y-4">
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                                You are signed in.
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <Link to={decodeURIComponent(next)} className="primary-button w-fit">
                                    Continue
                                </Link>
                                <button onClick={auth.signOut} className="secondary-button w-fit">
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
                            {error ? <p className="alert-error">{error}</p> : null}

                            <div className="form-div">
                                <label htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    disabled={isBusy}
                                    required
                                />
                            </div>

                            <div className="form-div">
                                <label htmlFor="password">Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete={mode === "sign_in" ? "current-password" : "new-password"}
                                    placeholder="Minimum 6 characters"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    disabled={isBusy}
                                    minLength={6}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="primary-button w-full"
                                disabled={isBusy}
                            >
                                {mode === "sign_in" ? (
                                    <>
                                        <LockKeyhole className="size-4" aria-hidden="true" />
                                        Sign In
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="size-4" aria-hidden="true" />
                                        Create Account
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </section>
            </div>
        </main>
    );
};

export default Auth;
