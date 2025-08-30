import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import GlassSurface from "../../Animations/GlassSurface/GlassSurface";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";

const ResumeCard = ({
                        resume: { id, companyName, jobTitle, feedback, imagePath }
                    }: { resume: Resume }) => {
    const { fs } = usePuterStore();
    const [resumeUrl, setResumeUrl] = useState('');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        const loadResume = async () => {
            const blob = await fs.read(imagePath);
            if (!blob) return;
            let url = URL.createObjectURL(blob);
            setResumeUrl(url);
        };

        loadResume()
    }, [imagePath]);

    // Fallback for server-side rendering
    if (!isClient) {
        return (
            <Link to={`/resume/${id}`} className="resume-card animate-in fade-in duration-1000">
                <div className="resume-card-header">
                    <div className="flex flex-col gap-2">
                        {companyName && <h2 className="!text-black font-bold break-words ">{companyName}</h2>}
                        {jobTitle && <h3 className="text-lg break-words text-gray-500">{jobTitle}</h3>}
                        {!companyName && !jobTitle && <h2 className="!text-black font-bold">Resume</h2>}
                    </div>
                    <div className="flex-shrink-0">
                        <ScoreCircle score={feedback.overallScore} />
                    </div>
                </div>
                {resumeUrl && (
                    <div className="gradient-border animate-in fade-in duration-1000">
                        <div className="w-full h-full">
                            <img
                                src={resumeUrl}
                                alt="resume"
                                className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"
                            />
                        </div>
                    </div>
                )}
            </Link>
        );
    }

    return (
        <Link to={`/resume/${id}`} className="block">
            <GlassSurface
                width="100%"
                height="auto"
                borderRadius={50}
                className="hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
                backgroundOpacity={0.08}
                blur={22}
                brightness={92}
                opacity={0.5}
                saturation={1.1}
                displace={0.5}
                distortionScale={-140}
                redOffset={1}
                greenOffset={3}
                blueOffset={6}
            >
                <div className="w-full p-6">
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex flex-col gap-2 flex-1 min-w-0">
                            {companyName && (
                                <h2 className="text-white font-bold break-words text-xl group-hover:text-white/90 transition-colors">
                                    {companyName}
                                </h2>
                            )}
                            {jobTitle && (
                                <h3 className="text-lg break-words text-white/70 group-hover:text-white/60 transition-colors">
                                    {jobTitle}
                                </h3>
                            )}
                            {!companyName && !jobTitle && (
                                <h2 className="text-white font-bold text-xl">Resume</h2>
                            )}
                        </div>
                        <div className="flex-shrink-0 ml-4">
                            <ScoreCircle score={feedback.overallScore} />
                        </div>
                    </div>

                    {/* Resume Image Section */}
                    {resumeUrl && (
                        <GlassSurface
                            width="100%"
                            height={350}
                            borderRadius={16}
                            className="animate-in fade-in  overflow-hidden group-hover:scale-[1.01] transition-transform duration-300"
                            backgroundOpacity={0.05}
                            blur={8}
                            brightness={95}
                            opacity={0.9}
                            saturation={1.05}
                        >
                            <div className="w-full h-full relative overflow-hidden rounded-2xl">
                                <img
                                    src={resumeUrl}
                                    alt="resume preview"
                                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                />
                                {/* Overlay gradient for better text readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                        </GlassSurface>
                    )}

                    {/* Loading state */}
                    {!resumeUrl && (
                        <GlassSurface
                            width="100%"
                            height={350}
                            borderRadius={16}
                            className="animate-pulse"
                            backgroundOpacity={0.1}
                            blur={10}
                            brightness={90}
                        >
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="text-white/60">Loading preview...</div>
                            </div>
                        </GlassSurface>
                    )}
                </div>
            </GlassSurface>
        </Link>
    );
};

export default ResumeCard;
