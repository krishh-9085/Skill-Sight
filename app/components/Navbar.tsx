import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from "react-router";
import GlassSurface from "../../Animations/GlassSurface/GlassSurface";
import { usePuterStore } from "~/lib/puter";

export const Navbar = () => {
    const [isClient, setIsClient] = useState(false);
    const [showLogout, setShowLogout] = useState(false);
    const { auth } = usePuterStore();
    const navigate = useNavigate();

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Lock body scroll and handle Escape key when logout modal is open
    useEffect(() => {
        if (!isClient) return;
        if (showLogout) {
            const prevOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            const onKey = (e: KeyboardEvent) => {
                if (e.key === 'Escape') setShowLogout(false);
            };
            window.addEventListener('keydown', onKey);
            return () => {
                document.body.style.overflow = prevOverflow;
                window.removeEventListener('keydown', onKey);
            };
        }
    }, [showLogout, isClient]);

    if (!isClient) {
        return (
            <nav className="navbar">
                <Link to="/">
                    <p className="text-2xl font-bold text-white">SkillSight</p>
                </Link>
                <Link to="/upload" className="primary-button w-fit">
                    Upload Resume
                </Link>
            </nav>
        );
    }

    return (
        <div className="w-full flex justify-center pt-3 px-2 sm:pt-4 sm:px-4 ">
            <GlassSurface
                width="100%"
                height={60}
                borderRadius={50} // More rounded corners for modern look
                className="max-w-6xl"
                backgroundOpacity={0.08}
                blur={15}
                brightness={88}
                opacity={0.95}
                saturation={1.1}
                displace={0.5}
                distortionScale={-120}
                redOffset={1}
                greenOffset={3}
                blueOffset={6}
            >
                <div className="w-full flex items-center justify-between px-4 sm:px-8 gap-2">
                    <Link to="/" className="hover:scale-105 transition-transform duration-200 min-w-0">
                        <p className="text-xl sm:text-2xl font-bold text-white truncate">SkillSight</p>
                    </Link>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {/* Mobile actions: round icon buttons */}
                        <div className="flex sm:hidden items-center gap-3  ">
                            <Link to="/upload" aria-label="Upload" title="Upload">
                                <GlassSurface
                                    width={44}
                                    height={44}
                                    borderRadius={999}
                                    className="group p-0 flex items-center justify-center active:scale-95 transition-all"
                                    backgroundOpacity={0.25}
                                    blur={8}
                                    brightness={95}
                                    opacity={0.92}
                                    saturation={1.3}
                                    displace={0.8}
                                    distortionScale={-100}
                                    redOffset={2}
                                    greenOffset={4}
                                    blueOffset={8}
                                >
                                    <svg
                                        className="w-5 h-5 text-white/90 group-hover:text-white transition-colors"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                        />
                                    </svg>
                                </GlassSurface>
                            </Link>
                            {auth.isAuthenticated && (
                                <button
                                    aria-label="Log out"
                                    title="Log out"
                                    onClick={() => setShowLogout(true)}
                                >
                                    <GlassSurface
                                        width={44}
                                        height={44}
                                        borderRadius={999}
                                        className="group p-0 flex items-center justify-center active:scale-95 transition-all"
                                        backgroundOpacity={0.25}
                                        blur={8}
                                        brightness={95}
                                        opacity={0.92}
                                        saturation={1.3}
                                        displace={0.8}
                                        distortionScale={-100}
                                        redOffset={2}
                                        greenOffset={4}
                                        blueOffset={8}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white/90 group-hover:text-white">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h7a1 1 0 011 1v3M12 20H4a1 1 0 01-1-1V5" />
                                        </svg>
                                    </GlassSurface>
                                </button>
                            )}
                        </div>

                        {/* Desktop actions: pill upload button */}
                        <div className="hidden sm:block">
                            <Link to="/upload">
                                <GlassSurface
                                    width="auto"
                                    height={48}
                                    borderRadius={50}
                                    className="group px-5 sm:px-8 py-2.5 sm:py-3 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all duration-300 ease-out"
                                    backgroundOpacity={0.25}
                                    blur={8}
                                    brightness={95}
                                    opacity={0.92}
                                    saturation={1.3}
                                    displace={0.8}
                                    distortionScale={-100}
                                    redOffset={2}
                                    greenOffset={4}
                                    blueOffset={8}
                                >
                                    <div className="flex items-center gap-2">
                                        <svg
                                            className="w-4 h-4 text-white/90 group-hover:text-white transition-colors"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                            />
                                        </svg>
                                        <span className="text-white/90 group-hover:text-white font-medium text-[13px] sm:text-sm transition-colors">
                                            Upload Resume
                                        </span>
                                    </div>
                                </GlassSurface>
                            </Link>
                        </div>

                        {auth.isAuthenticated && (
                            <>
                                <button
                                    onClick={() => setShowLogout(true)}
                                    className="hidden sm:inline-flex text-white/90 hover:text-white font-medium text-[13px] sm:text-sm px-3 sm:px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10 transition-all"
                                >
                                    Log out
                                </button>

                                {showLogout && isClient && typeof document !== 'undefined' && createPortal(
                                    <div className="fixed inset-0 z-[1000] pointer-events-auto">
                                        {/* invisible overlay to block background interaction */}
                                        <div className="absolute inset-0" onClick={() => setShowLogout(false)} />
                                        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-start justify-center w-full pt-[env(safe-area-inset-top)]">
                                            <div className="relative z-[1001] w-[96%] sm:w-[90%] max-w-sm mx-auto">
                                                <GlassSurface
                                                width="100%"
                                                height={200}
                                                borderRadius={24}
                                                className="p-4 sm:p-6"
                                                backgroundOpacity={0.4}
                                                blur={18}
                                                brightness={85}
                                                opacity={0.98}
                                                saturation={1.1}
                                                displace={0.5}
                                                distortionScale={-60}
                                                redOffset={2}
                                                greenOffset={5}
                                                blueOffset={9}
                                            >
                                                <div className="flex flex-col gap-4 max-h-[160px] sm:max-h-none overflow-y-auto">
                                                    <div className="flex items-start gap-3 sm:gap-4">
                                                        <div className="shrink-0 rounded-full bg-white/15 p-2 border border-white/20">
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white/90">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h7a1 1 0 011 1v3M12 20H4a1 1 0 01-1-1V5" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-white text-base sm:text-lg font-semibold drop-shadow">Log out?</h3>
                                                            <p className="text-white/90 drop-shadow-sm text-xs sm:text-sm">Are you sure you want to log out?</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 sm:gap-3 justify-end mt-2">
                                                        <button
                                                            onClick={() => setShowLogout(false)}
                                                            className="px-3 sm:px-4 py-2 rounded-xl border border-white/30 bg-black/20 backdrop-blur-[1px] text-white hover:bg-black/30 transition"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                setShowLogout(false);
                                                                await auth.signOut();
                                                                navigate('/auth?next=/');
                                                            }}
                                                            className="px-3 sm:px-4 py-2 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-semibold shadow-lg shadow-red-500/20 transition"
                                                        >
                                                            Log out
                                                        </button>
                                                    </div>
                                                </div>
                                            </GlassSurface>
                                            </div>
                                        </div>
                                    </div>,
                                    document.body
                                )}
                            </>
                        )}
                    </div>
                </div>
            </GlassSurface>
        </div>
    )
}
