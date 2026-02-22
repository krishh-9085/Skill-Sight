import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAppStore } from "~/lib/cloud";
import PageShell from "~/components/PageShell";
import { AlertTriangle, DatabaseZap, LoaderCircle, Shield, Trash2 } from "lucide-react";

type StoredResume = {
    key: string;
    resume: Resume;
};

const DEFAULT_ALLOWED_EMAIL = "rohillakrish2@gmail.com";

const parseAllowedEmails = (): Set<string> => {
    const raw = (import.meta.env.VITE_WIPE_ALLOWED_EMAILS || DEFAULT_ALLOWED_EMAIL) as string;
    const emails = raw
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter((value) => value.includes("@"));
    return new Set(emails);
};

const resolveUserEmail = (user: AppUser | null): string => {
    if (!user) return "";
    const candidates = [user.email, user.username];
    for (const value of candidates) {
        if (typeof value === "string" && value.includes("@")) {
            return value.trim().toLowerCase();
        }
    }
    return "";
};

const WipeApp = () => {
    const { auth, isLoading, error, fs, kv } = useAppStore();
    const navigate = useNavigate();

    const [records, setRecords] = useState<StoredResume[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [deletingKey, setDeletingKey] = useState<string | null>(null);
    const [isWipingAll, setIsWipingAll] = useState(false);
    const [localError, setLocalError] = useState("");

    const allowedEmails = useMemo(() => parseAllowedEmails(), []);
    const currentEmail = resolveUserEmail(auth.user);
    const isAuthorized = Boolean(currentEmail && allowedEmails.has(currentEmail));

    const loadRecords = async () => {
        setIsFetching(true);
        setLocalError("");
        try {
            const listed = (await kv.list("resume:*", true)) as KVItem[] | undefined;
            const parsed: StoredResume[] = (listed || [])
                .map((entry) => {
                    try {
                        const resume = JSON.parse(entry.value) as Resume;
                        if (!resume?.id || !resume?.resumePath) return null;
                        return { key: entry.key, resume };
                    } catch {
                        return null;
                    }
                })
                .filter((item): item is StoredResume => Boolean(item));
            setRecords(parsed);
        } catch (loadError) {
            const message = loadError instanceof Error ? loadError.message : "Failed to load records.";
            setLocalError(message);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate("/auth?next=/wipe");
        }
    }, [auth.isAuthenticated, isLoading, navigate]);

    useEffect(() => {
        if (!isLoading && auth.isAuthenticated && isAuthorized) {
            void loadRecords();
        }
    }, [auth.isAuthenticated, isAuthorized, isLoading]);

    const handleDeleteOne = async (item: StoredResume) => {
        setDeletingKey(item.key);
        setLocalError("");
        try {
            const paths = [item.resume.resumePath, item.resume.imagePath].filter(Boolean);
            await Promise.all(paths.map((path) => fs.delete(path)));
            await kv.delete(item.key);
            await loadRecords();
        } catch (deleteError) {
            const message = deleteError instanceof Error ? deleteError.message : "Failed to delete record.";
            setLocalError(message);
        } finally {
            setDeletingKey(null);
        }
    };

    const handleWipeAll = async () => {
        setIsWipingAll(true);
        setLocalError("");
        try {
            await kv.flush();
            await loadRecords();
        } catch (wipeError) {
            const message = wipeError instanceof Error ? wipeError.message : "Failed to wipe all records.";
            setLocalError(message);
        } finally {
            setIsWipingAll(false);
        }
    };

    if (isLoading) {
        return (
            <PageShell>
                <div className="surface-card flex items-center gap-2 text-slate-600">
                    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                    Loading...
                </div>
            </PageShell>
        );
    }

    if (error) {
        return (
            <PageShell>
                <div className="alert-error w-full max-w-3xl">
                    Error: {error}
                </div>
            </PageShell>
        );
    }

    if (auth.isAuthenticated && !isAuthorized) {
        return (
            <PageShell>
                <section className="surface-card w-full max-w-3xl">
                    <span className="page-kicker">
                        <Shield className="size-3.5" aria-hidden="true" />
                        Restricted
                    </span>
                    <h1 className="mt-3 text-3xl font-semibold text-slate-900">Access Denied</h1>
                    <p className="mt-2 text-slate-600">
                        `/wipe` is limited to the owner account only.
                    </p>
                    <Link to="/" className="secondary-button mt-4 w-fit">
                        Back to Dashboard
                    </Link>
                </section>
            </PageShell>
        );
    }

    return (
        <PageShell>
            <section className="surface-card w-full max-w-4xl">
                <span className="page-kicker">
                    <DatabaseZap className="size-3.5" aria-hidden="true" />
                    Maintenance
                </span>
                <h1 className="mt-3 text-3xl font-semibold text-slate-900">Manage Stored Analyses</h1>
                <p className="mt-2 text-slate-600">
                    Signed in as <span className="font-semibold text-slate-800">{auth.user?.username}</span>
                </p>

                {localError ? <p className="alert-error mt-4">{localError}</p> : null}

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.1em] text-slate-500">Saved analyses</p>
                    {isFetching ? (
                        <div className="mt-3 flex items-center gap-2 text-slate-600">
                            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                            Loading records...
                        </div>
                    ) : (
                        <div className="mt-3 flex flex-col gap-3">
                            {records.map((item) => (
                                <article
                                    key={item.key}
                                    className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-slate-900">
                                            {item.resume.companyName || item.resume.jobTitle || "Untitled resume"}
                                        </p>
                                        <p className="mt-1 truncate text-sm text-slate-600">
                                            {item.resume.jobTitle || "No job title"}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {item.resume.resumePath}
                                        </p>
                                    </div>
                                    <button
                                        className="secondary-button w-full sm:w-fit"
                                        onClick={() => handleDeleteOne(item)}
                                        disabled={Boolean(deletingKey || isWipingAll)}
                                    >
                                        {deletingKey === item.key ? (
                                            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                                        ) : (
                                            <Trash2 className="size-4" aria-hidden="true" />
                                        )}
                                        Delete
                                    </button>
                                </article>
                            ))}
                            {records.length === 0 ? <p className="text-sm text-slate-500">No stored analyses.</p> : null}
                        </div>
                    )}
                </div>

                <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-rose-700">
                        <AlertTriangle className="size-4" aria-hidden="true" />
                        Wipe all removes every saved analysis and related files.
                    </p>
                    <button
                        className="primary-button mt-3 w-full sm:w-fit"
                        onClick={handleWipeAll}
                        disabled={Boolean(deletingKey || isWipingAll || records.length === 0)}
                    >
                        {isWipingAll ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Trash2 className="size-4" aria-hidden="true" />}
                        Wipe All Data
                    </button>
                </div>
            </section>
        </PageShell>
    );
};

export default WipeApp;
