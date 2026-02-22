import { create } from "zustand";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

type AuthSignInInput = {
    email: string;
    password: string;
    mode?: "sign_in" | "sign_up";
};

interface AppStore {
    isLoading: boolean;
    error: string | null;
    appReady: boolean;
    auth: {
        user: AppUser | null;
        isAuthenticated: boolean;
        signIn: (input: AuthSignInInput) => Promise<void>;
        signOut: () => Promise<void>;
        refreshUser: () => Promise<void>;
        checkAuthStatus: () => Promise<boolean>;
        getUser: () => AppUser | null;
    };
    fs: {
        write: (
            path: string,
            data: string | File | Blob
        ) => Promise<File | undefined>;
        read: (path: string) => Promise<Blob | undefined>;
        upload: (file: File[] | Blob[]) => Promise<FSItem | undefined>;
        delete: (path: string) => Promise<void>;
        readDir: (path: string) => Promise<FSItem[] | undefined>;
    };
    ai: {
        chat: (
            prompt: string | ChatMessage[],
            imageURL?: string | AIChatOptions,
            testMode?: boolean,
            options?: AIChatOptions
        ) => Promise<AIResponse | undefined>;
        feedback: (
            path: string,
            payload: { jobTitle?: string; jobDescription?: string } | string
        ) => Promise<AIResponse | undefined>;
        img2txt: (
            image: string | File | Blob,
            testMode?: boolean
        ) => Promise<string | undefined>;
    };
    kv: {
        get: (key: string) => Promise<string | null | undefined>;
        set: (key: string, value: string) => Promise<boolean | undefined>;
        delete: (key: string) => Promise<boolean | undefined>;
        list: (
            pattern: string,
            returnValues?: boolean
        ) => Promise<string[] | KVItem[] | undefined>;
        flush: () => Promise<boolean | undefined>;
    };

    init: () => void;
    clearError: () => void;
}

type ResumeDbRow = {
    id: string;
    user_id: string | null;
    company_name: string | null;
    job_title: string | null;
    job_description: string | null;
    image_path: string;
    resume_path: string;
    feedback: Feedback;
    created_at?: string;
};

const TABLE = "resumes";
const RESUME_KEY_PREFIX = "resume:";

const getBucketName = (): string =>
    import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || "resumes";

let supabase: SupabaseClient | null = null;
let authSubscription: { unsubscribe: () => void } | null = null;

const getSupabase = (): SupabaseClient | null => {
    if (supabase) return supabase;

    const url = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !anonKey) return null;

    supabase = createClient(url, anonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
    });
    return supabase;
};

const createId = (): string =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const sanitizeFileName = (name: string): string =>
    name.replace(/[^a-zA-Z0-9._-]/g, "_");

const normalizeStoragePath = (path: string): string => path.trim().replace(/^\/+/, "");

const toFSItem = (path: string, uid: string, name?: string, size?: number): FSItem => ({
    id: createId(),
    uid,
    name: name || path.split("/").pop() || "file",
    path,
    is_dir: false,
    parent_id: "root",
    parent_uid: uid,
    created: Date.now(),
    modified: Date.now(),
    accessed: Date.now(),
    size: size ?? null,
    writable: true,
});

const extractResumeId = (key: string): string | null =>
    key.startsWith(RESUME_KEY_PREFIX)
        ? key.slice(RESUME_KEY_PREFIX.length)
        : null;

const mapDbToResume = (row: ResumeDbRow): Resume => ({
    id: row.id,
    companyName: row.company_name || "",
    jobTitle: row.job_title || "",
    jobDescription: row.job_description || "",
    imagePath: row.image_path,
    resumePath: row.resume_path,
    feedback: row.feedback,
});

const mapResumeToDb = (
    resume: Resume & { jobDescription?: string },
    ownerId: string
): ResumeDbRow => ({
    id: resume.id,
    user_id: ownerId,
    company_name: resume.companyName || "",
    job_title: resume.jobTitle || "",
    job_description: resume.jobDescription || "",
    image_path: resume.imagePath,
    resume_path: resume.resumePath,
    feedback: resume.feedback,
});

const mapSupabaseUser = (user: User | null): AppUser | null => {
    if (!user) return null;
    return {
        uuid: user.id,
        username: user.email || "user",
        email: user.email || undefined,
    };
};

const requireSupabase = (): SupabaseClient => {
    const client = getSupabase();
    if (!client) {
        throw new Error(
            "Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
        );
    }
    return client;
};

const logError = (scope: string, error: unknown, extra?: Record<string, unknown>) => {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    console.error(`[SkillSight:${scope}]`, { message, stack, ...extra });
};

const mapAuthErrorMessage = (
    rawMessage: string,
    mode: "sign_in" | "sign_up"
): string => {
    const message = rawMessage.trim();
    const normalized = message.toLowerCase();

    if (normalized.includes("invalid login credentials")) {
        return "Incorrect email or password. Please try again.";
    }
    if (normalized.includes("email not confirmed")) {
        return "Check your inbox and confirm your email before signing in.";
    }
    if (normalized.includes("user already registered")) {
        return mode === "sign_up"
            ? "An account with this email already exists. Use sign in instead."
            : "This account already exists.";
    }
    if (normalized.includes("password should be at least")) {
        return "Password must be at least 6 characters.";
    }
    if (normalized.includes("invalid email")) {
        return "Enter a valid email address.";
    }
    if (normalized.includes("rate limit") || normalized.includes("too many requests")) {
        return "Too many attempts. Please wait a minute and try again.";
    }

    return message || "Authentication failed.";
};

export const useAppStore = create<AppStore>((set, get) => {
    const setError = (msg: string) => {
        set({
            error: msg,
            isLoading: false,
        });
    };

    const setAuthUser = (user: AppUser | null) => {
        set((state) => ({
            isLoading: false,
            error: null,
            auth: {
                ...state.auth,
                user,
                isAuthenticated: Boolean(user),
            },
        }));
    };

    const checkAuthStatus = async (): Promise<boolean> => {
        try {
            const supabaseClient = requireSupabase();
            const { data, error } = await supabaseClient.auth.getSession();
            if (error) throw error;

            const user = mapSupabaseUser(data.session?.user ?? null);
            setAuthUser(user);
            return Boolean(user);
        } catch (error) {
            logError("auth.check", error);
            setAuthUser(null);
            return false;
        }
    };

    const requireAuthUser = async (): Promise<AppUser> => {
        const current = get().auth.user;
        if (current) return current;

        const authenticated = await checkAuthStatus();
        if (!authenticated) {
            throw new Error("You must be signed in to continue.");
        }

        const user = get().auth.user;
        if (!user) throw new Error("Authentication state is unavailable.");
        return user;
    };

    const requireAccessToken = async (): Promise<string> => {
        const supabaseClient = requireSupabase();
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) throw error;

        const token = data.session?.access_token;
        if (!token) throw new Error("You must be signed in to continue.");
        return token;
    };

    const assertOwnedPath = (path: string, ownerId: string): string => {
        const normalized = normalizeStoragePath(path);
        if (!normalized) throw new Error("Invalid storage path.");
        if (!normalized.startsWith(`${ownerId}/`)) {
            throw new Error("Access denied for this file path.");
        }
        return normalized;
    };

    const signIn = async (input: AuthSignInInput): Promise<void> => {
        const mode = input.mode || "sign_in";
        set({ isLoading: true, error: null });
        try {
            const supabaseClient = requireSupabase();
            const email = input.email.trim().toLowerCase();
            const password = input.password;

            if (!email || !password) {
                throw new Error("Email and password are required.");
            }

            if (mode === "sign_up") {
                const { data, error } = await supabaseClient.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;

                if (!data.session) {
                    set({
                        isLoading: false,
                        error: "Account created. Confirm your email, then sign in.",
                    });
                    return;
                }
            } else {
                const { error } = await supabaseClient.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }

            await checkAuthStatus();
        } catch (error) {
            logError("auth.signIn", error);
            const rawMessage = error instanceof Error ? error.message : "Failed to sign in.";
            const message = mapAuthErrorMessage(rawMessage, mode);
            setError(message);
        }
    };

    const signOut = async (): Promise<void> => {
        set({ isLoading: true, error: null });
        try {
            const supabaseClient = requireSupabase();
            const { error } = await supabaseClient.auth.signOut();
            if (error) throw error;
            setAuthUser(null);
        } catch (error) {
            logError("auth.signOut", error);
            const message = error instanceof Error ? error.message : "Failed to sign out.";
            setError(message);
        }
    };

    const refreshUser = async (): Promise<void> => {
        await checkAuthStatus();
    };

    const init = (): void => {
        set({ appReady: true, isLoading: true, error: null });
        try {
            const supabaseClient = requireSupabase();
            if (!authSubscription) {
                const { data } = supabaseClient.auth.onAuthStateChange((_event, session) => {
                    const user = mapSupabaseUser(session?.user ?? null);
                    set((state) => ({
                        isLoading: false,
                        auth: {
                            ...state.auth,
                            user,
                            isAuthenticated: Boolean(user),
                        },
                    }));
                });
                authSubscription = data.subscription;
            }
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Failed to initialize cloud client.";
            setError(message);
            return;
        }

        void checkAuthStatus();
    };

    const write = async (path: string, data: string | File | Blob): Promise<File | undefined> => {
        try {
            const supabaseClient = requireSupabase();
            const owner = await requireAuthUser();
            const bucket = getBucketName();
            const blob = typeof data === "string" ? new Blob([data], { type: "text/plain" }) : data;
            const normalizedPath = normalizeStoragePath(path || "");
            const filePath = normalizedPath
                ? normalizedPath.startsWith(`${owner.uuid}/`)
                    ? normalizedPath
                    : `${owner.uuid}/${normalizedPath}`
                : `${owner.uuid}/${createId()}`;

            const { error } = await supabaseClient.storage.from(bucket).upload(filePath, blob, {
                upsert: true,
                contentType: blob.type || "application/octet-stream",
            });
            if (error) throw error;

            const finalName = sanitizeFileName(filePath.split("/").pop() || filePath);
            return blob instanceof File ? blob : new File([blob], finalName, { type: blob.type });
        } catch (error) {
            logError("fs.write", error, { path });
            const message = error instanceof Error ? error.message : "Failed to write file.";
            setError(message);
            return undefined;
        }
    };

    const readFile = async (path: string): Promise<Blob | undefined> => {
        try {
            const supabaseClient = requireSupabase();
            const ownerId = (await requireAuthUser()).uuid;
            const bucket = getBucketName();
            const filePath = assertOwnedPath(path, ownerId);
            const { data, error } = await supabaseClient.storage.from(bucket).download(filePath);
            if (error) throw error;
            return data || undefined;
        } catch (error) {
            logError("fs.read", error, { path });
            const message = error instanceof Error ? error.message : "Failed to read file.";
            setError(message);
            return undefined;
        }
    };

    const upload = async (files: File[] | Blob[]): Promise<FSItem | undefined> => {
        try {
            const supabaseClient = requireSupabase();
            const ownerId = (await requireAuthUser()).uuid;
            const bucket = getBucketName();
            const file = files[0];
            if (!file) return undefined;

            const extension = file instanceof File && file.name.includes(".")
                ? file.name.split(".").pop()
                : "bin";
            const fileName = file instanceof File ? sanitizeFileName(file.name) : `${createId()}.${extension}`;
            const path = `${ownerId}/${createId()}/${fileName}`;

            const { error } = await supabaseClient.storage.from(bucket).upload(path, file, {
                upsert: false,
                contentType: file.type || "application/octet-stream",
            });

            if (error) throw error;
            return toFSItem(path, ownerId, fileName, file.size);
        } catch (error) {
            logError("fs.upload", error);
            const message = error instanceof Error ? error.message : "Failed to upload file.";
            setError(message);
            return undefined;
        }
    };

    const deleteFile = async (path: string): Promise<void> => {
        try {
            const supabaseClient = requireSupabase();
            const ownerId = (await requireAuthUser()).uuid;
            const bucket = getBucketName();
            const filePath = assertOwnedPath(path, ownerId);
            const { error } = await supabaseClient.storage.from(bucket).remove([filePath]);
            if (error) throw error;
        } catch (error) {
            logError("fs.delete", error, { path });
            const message = error instanceof Error ? error.message : "Failed to delete file.";
            setError(message);
        }
    };

    const readDir = async (_path: string): Promise<FSItem[] | undefined> => {
        try {
            const supabaseClient = requireSupabase();
            const ownerId = (await requireAuthUser()).uuid;
            const { data, error } = await supabaseClient
                .from(TABLE)
                .select("resume_path,image_path")
                .eq("user_id", ownerId)
                .limit(1000);
            if (error) throw error;

            const filePaths = new Set<string>();
            (data || []).forEach((row: { resume_path: string; image_path: string }) => {
                if (row.resume_path) filePaths.add(row.resume_path);
                if (row.image_path) filePaths.add(row.image_path);
            });
            return Array.from(filePaths).map((path) => toFSItem(path, ownerId));
        } catch (error) {
            logError("fs.readDir", error);
            const message = error instanceof Error ? error.message : "Failed to list files.";
            setError(message);
            return undefined;
        }
    };

    const chat = async (
        _prompt: string | ChatMessage[],
        _imageURL?: string | AIChatOptions,
        _testMode?: boolean,
        _options?: AIChatOptions
    ): Promise<AIResponse | undefined> => {
        setError("Direct chat is not configured. Use feedback analysis.");
        return undefined;
    };

    const feedback = async (
        path: string,
        feedbackPayload: { jobTitle?: string; jobDescription?: string } | string
    ): Promise<AIResponse | undefined> => {
        try {
            const accessToken = await requireAccessToken();
            const requestBody =
                typeof feedbackPayload === "string"
                    ? { path, message: feedbackPayload }
                    : {
                        path,
                        jobTitle: feedbackPayload.jobTitle || "",
                        jobDescription: feedbackPayload.jobDescription || "",
                    };
            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                console.error("[SkillSight:ai.feedback] API request failed", {
                    status: response.status,
                    statusText: response.statusText,
                    body,
                });
                throw new Error(body?.error || "Failed to analyze resume.");
            }

            const responsePayload = await response.json();
            return {
                index: 0,
                message: {
                    role: "assistant",
                    content: JSON.stringify(responsePayload.feedback),
                    refusal: null,
                    annotations: [],
                },
                logprobs: null,
                finish_reason: "stop",
                usage: [],
                via_ai_chat_service: false,
            };
        } catch (error) {
            logError("ai.feedback", error, { path });
            const messageText =
                error instanceof Error ? error.message : "Failed to analyze resume.";
            setError(messageText);
            throw new Error(messageText);
        }
    };

    const img2txt = async (
        _image: string | File | Blob,
        _testMode?: boolean
    ): Promise<string | undefined> => {
        setError("img2txt is not configured.");
        return undefined;
    };

    const getKV = async (key: string): Promise<string | null | undefined> => {
        try {
            const supabaseClient = requireSupabase();
            const ownerId = (await requireAuthUser()).uuid;
            const id = extractResumeId(key);
            if (!id) return null;

            const { data, error } = await supabaseClient
                .from(TABLE)
                .select("*")
                .eq("id", id)
                .eq("user_id", ownerId)
                .maybeSingle();

            if (error) throw error;
            if (!data) return null;

            return JSON.stringify(mapDbToResume(data as ResumeDbRow));
        } catch (error) {
            logError("kv.get", error, { key });
            const message = error instanceof Error ? error.message : "Failed to read item.";
            setError(message);
            return undefined;
        }
    };

    const setKV = async (key: string, value: string): Promise<boolean | undefined> => {
        try {
            const supabaseClient = requireSupabase();
            const ownerId = (await requireAuthUser()).uuid;
            const id = extractResumeId(key);
            if (!id) return false;

            const parsed = JSON.parse(value) as Resume & { jobDescription?: string };
            const row = mapResumeToDb(parsed, ownerId);
            const { error } = await supabaseClient.from(TABLE).upsert(row);
            if (error) throw error;
            return true;
        } catch (error) {
            logError("kv.set", error, { key });
            const message = error instanceof Error ? error.message : "Failed to save item.";
            setError(message);
            return undefined;
        }
    };

    const deleteKV = async (key: string): Promise<boolean | undefined> => {
        try {
            const supabaseClient = requireSupabase();
            const ownerId = (await requireAuthUser()).uuid;
            const id = extractResumeId(key);
            if (!id) return false;
            const { error } = await supabaseClient
                .from(TABLE)
                .delete()
                .eq("id", id)
                .eq("user_id", ownerId);
            if (error) throw error;
            return true;
        } catch (error) {
            logError("kv.delete", error, { key });
            const message = error instanceof Error ? error.message : "Failed to delete item.";
            setError(message);
            return undefined;
        }
    };

    const listKV = async (
        pattern: string,
        returnValues = false
    ): Promise<string[] | KVItem[] | undefined> => {
        try {
            if (pattern !== "resume:*") return [];
            const supabaseClient = requireSupabase();
            const ownerId = (await requireAuthUser()).uuid;
            const { data, error } = await supabaseClient
                .from(TABLE)
                .select("*")
                .eq("user_id", ownerId)
                .order("created_at", { ascending: false });

            if (error) throw error;

            const rows = (data || []) as ResumeDbRow[];
            if (!returnValues) return rows.map((row) => `${RESUME_KEY_PREFIX}${row.id}`);

            return rows.map((row) => ({
                key: `${RESUME_KEY_PREFIX}${row.id}`,
                value: JSON.stringify(mapDbToResume(row)),
            }));
        } catch (error) {
            logError("kv.list", error, { pattern, returnValues });
            const message = error instanceof Error ? error.message : "Failed to list items.";
            setError(message);
            return undefined;
        }
    };

    const flushKV = async (): Promise<boolean | undefined> => {
        try {
            const supabaseClient = requireSupabase();
            const ownerId = (await requireAuthUser()).uuid;
            const { error: selectError, data } = await supabaseClient
                .from(TABLE)
                .select("resume_path,image_path")
                .eq("user_id", ownerId)
                .limit(10000);
            if (selectError) throw selectError;

            const paths = new Set<string>();
            (data || []).forEach((row: { resume_path: string; image_path: string }) => {
                if (row.resume_path) paths.add(row.resume_path);
                if (row.image_path) paths.add(row.image_path);
            });

            const { error: deleteRowsError } = await supabaseClient
                .from(TABLE)
                .delete()
                .eq("user_id", ownerId);
            if (deleteRowsError) throw deleteRowsError;

            if (paths.size > 0) {
                const { error: deleteFilesError } = await supabaseClient
                    .storage
                    .from(getBucketName())
                    .remove(Array.from(paths));
                if (deleteFilesError) throw deleteFilesError;
            }
            return true;
        } catch (error) {
            logError("kv.flush", error);
            const message = error instanceof Error ? error.message : "Failed to flush data.";
            setError(message);
            return undefined;
        }
    };

    return {
        isLoading: true,
        error: null,
        appReady: false,
        auth: {
            user: null,
            isAuthenticated: false,
            signIn,
            signOut,
            refreshUser,
            checkAuthStatus,
            getUser: () => get().auth.user,
        },
        fs: {
            write: (path: string, data: string | File | Blob) => write(path, data),
            read: (path: string) => readFile(path),
            readDir: (path: string) => readDir(path),
            upload: (files: File[] | Blob[]) => upload(files),
            delete: (path: string) => deleteFile(path),
        },
        ai: {
            chat: (
                prompt: string | ChatMessage[],
                imageURL?: string | AIChatOptions,
                testMode?: boolean,
                options?: AIChatOptions
            ) => chat(prompt, imageURL, testMode, options),
            feedback: (
                path: string,
                payload: { jobTitle?: string; jobDescription?: string } | string
            ) => feedback(path, payload),
            img2txt: (image: string | File | Blob, testMode?: boolean) =>
                img2txt(image, testMode),
        },
        kv: {
            get: (key: string) => getKV(key),
            set: (key: string, value: string) => setKV(key, value),
            delete: (key: string) => deleteKV(key),
            list: (pattern: string, returnValues?: boolean) =>
                listKV(pattern, returnValues),
            flush: () => flushKV(),
        },
        init,
        clearError: () => set({ error: null }),
    };
});
