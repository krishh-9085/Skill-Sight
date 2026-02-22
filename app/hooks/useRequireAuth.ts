import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAppStore } from "~/lib/cloud";

interface UseRequireAuthOptions {
    enabled?: boolean;
}

export const useRequireAuth = (options?: UseRequireAuthOptions) => {
    const { enabled = true } = options || {};
    const { auth, isLoading } = useAppStore();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!enabled) return;
        if (isLoading || auth.isAuthenticated) return;

        const nextPath = `${location.pathname}${location.search}`;
        navigate(`/auth?next=${encodeURIComponent(nextPath)}`);
    }, [auth.isAuthenticated, enabled, isLoading, location.pathname, location.search, navigate]);

    return {
        isAuthReady: !isLoading,
        isAuthenticated: auth.isAuthenticated,
    };
};
