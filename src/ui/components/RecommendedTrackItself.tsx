"use client";
import { useState } from "react";

// "type" is more flexible (allows for more use cases) than "interface"
type recommendedTrackProp = {
    name: string;
    artists: string[];
    video: string | null;
    links: { [key: string]: string };
    about: { [key: string]: string };
    comments: { [key: string]: string };
};

export default function RecommendedTrackItself({ recommendedTrack }: { recommendedTrack: recommendedTrackProp }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <details
            // Format
            className="p-4"
            style={{ background: "var(--secondary)" }}
        >
            {/* Details when collapsed */}
            <summary
                // Format
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div>
                    <h4 className="text-xl font-bold">{recommendedTrack.name}</h4>
                    <p>by {recommendedTrack.artists.join(", ")}</p>
                </div>
                <span style={{ color: "var(--primary)" }}>{isExpanded ? "▲" : "▼"}</span>
            </summary>

            {/* Separator */}
            <hr className="my-4" style={{ color: "var(--accent)" }} />

            {/* Details when expanded */}
            <div>
                {/* Video */}
                {recommendedTrack.video == null ? (
                    // When there IS NO YouTube video
                    <p className="mb-4 text-center text-gray-400 italic">No YouTube video available...</p>
                ) : (
                    // When there IS A YouTube video
                    <iframe
                        // Format
                        width="100%"
                        height="360"
                        src={`https://www.youtube.com/embed/${recommendedTrack.video}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="mb-4"
                    />
                )}

                {/* Links */}
                <div className="mb-4 flex items-center space-x-2">
                    <span>Listen at:</span>
                    <a className="px-2 py-1 bg-green-700 text-white hover:bg-green-500" href={recommendedTrack.links.spotify} target="_blank">
                        Spotify
                    </a>
                    <a className="px-2 py-1 bg-pink-700 text-white hover:bg-pink-500" href={recommendedTrack.links.appleMusic} target="_blank">
                        Apple Music
                    </a>
                    <a className="px-2 py-1 bg-red-700 text-white hover:bg-red-500" href={recommendedTrack.links.youtubeMusic} target="_blank">
                        YouTube Music
                    </a>
                </div>

                {/* About */}
                <div className="mb-4 flex items-center space-x-2">
                    <span>About:</span>
                    <a className="px-2 py-1 bg-yellow-300 text-black hover:bg-yellow-100" href={recommendedTrack.about.genius} target="_blank">
                        Genius
                    </a>
                    <a className="px-2 py-1 bg-red-700 text-white hover:bg-red-500" href={recommendedTrack.about.lastFm} target="_blank">
                        Last.fm
                    </a>
                </div>

                {/* Comments */}
                <div className="flex items-center space-x-2">
                    <span>Comments:</span>
                    <a className="px-2 py-1 bg-yellow-300 text-black hover:bg-yellow-100" href={recommendedTrack.comments.genius} target="_blank">
                        Genius
                    </a>
                    <a className="px-2 py-1 bg-red-700 text-white hover:bg-red-500" href={recommendedTrack.comments.lastFm} target="_blank">
                        Last.fm
                    </a>
                </div>
            </div>
        </details>
    );
}
