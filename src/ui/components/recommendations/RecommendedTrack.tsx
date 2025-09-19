"use client";
import { useState } from "react";

// `type` is more flexible and has more use cases than `interface`
export type recommendedTrackType = {
    name: string;
    artist: string;
    video: string | null;
    listenAtLinks: {
        spotify: string;
        appleMusic: string;
        youtubeMusic: string;
    };
    aboutLinks: {
        genius: string;
        lastFm: string;
    };
    comments: {
        genius: string;
        lastFm: string;
    };
    lyrics: string;
    // Need `?` because they are not submitted (i.e. undefined) on the first EVER page load
    genres?: string[] | null;
    genreSimilarity?: number | null;
    popularity?: number | null;
    releaseDate?: string | null;
    moods?: string[] | null;
};

export default function RecommendedTrack({ recommendedTrack }: { recommendedTrack: recommendedTrackType }) {
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
                    <p>by {recommendedTrack.artist}</p>
                    <br />
                    <div className="text-gray-400">
                        <p>
                            <b>Genres:</b> {recommendedTrack.genres?.join(", ")}
                        </p>
                        <p>
                            <b>Max Popularity:</b> {recommendedTrack.popularity}%
                        </p>
                        <p>
                            <b>Release Date (yyyy-mm-dd):</b> {recommendedTrack.releaseDate}
                        </p>
                        <p>
                            <b>Moods:</b> {recommendedTrack.moods?.join(", ")}
                        </p>
                    </div>
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
                    <a className="px-2 py-1 bg-green-700 text-white hover:bg-green-500" href={recommendedTrack.listenAtLinks.spotify} target="_blank">
                        Spotify
                    </a>
                    <a className="px-2 py-1 bg-pink-700 text-white hover:bg-pink-500" href={recommendedTrack.listenAtLinks.appleMusic} target="_blank">
                        Apple Music
                    </a>
                    <a className="px-2 py-1 bg-red-700 text-white hover:bg-red-500" href={recommendedTrack.listenAtLinks.youtubeMusic} target="_blank">
                        YouTube Music
                    </a>
                </div>

                {/* About */}
                <div className="mb-4 flex items-center space-x-2">
                    <span>About:</span>
                    <a className="px-2 py-1 bg-yellow-300 text-black hover:bg-yellow-100" href={recommendedTrack.aboutLinks.genius} target="_blank">
                        Genius
                    </a>
                    <a className="px-2 py-1 bg-red-700 text-white hover:bg-red-500" href={recommendedTrack.aboutLinks.lastFm} target="_blank">
                        Last.fm
                    </a>
                </div>

                {/* Comments */}
                <div className="mb-4 flex items-center space-x-2">
                    <span>Comments:</span>
                    <a className="px-2 py-1 bg-yellow-300 text-black hover:bg-yellow-100" href={recommendedTrack.comments.genius} target="_blank">
                        Genius
                    </a>
                    <a className="px-2 py-1 bg-red-700 text-white hover:bg-red-500" href={recommendedTrack.comments.lastFm} target="_blank">
                        Last.fm
                    </a>
                </div>

                {/* TODO Display the actual lyrics text (that is collapsible maybe?) instead of a button */}
                {/* Lyrics */}
                <div className="flex items-center space-x-2">
                    <p>Lyrics:</p>
                    <a className="px-2 py-1 bg-teal-300 text-black hover:bg-teal-100" href={recommendedTrack.lyrics} target="_blank">
                        Read here
                    </a>
                </div>
            </div>
        </details>
    );
}
