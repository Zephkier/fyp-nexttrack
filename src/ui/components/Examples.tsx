// NOTE This (entire .TSX file) is temporary and is to be removed/deleted when deployed

"use client";

type exampleTrackProp = {
    artistAndName: string;
    notes: string[];
    spotifyLink: string;
};

async function copyToClipboard(
    // Format
    text: string,
    event: React.MouseEvent<HTMLButtonElement>
) {
    const button = event.currentTarget;
    await navigator.clipboard.writeText(text);
    button.innerText = "Copied!";
    setTimeout(() => (button.innerText = "Copy"), 1000);
}

export default function Examples({ exampleTracks }: { exampleTracks: exampleTrackProp[] }) {
    return (
        <div>
            <h3
                // Format
                className="text-2xl font-bold mb-2"
                style={{ color: "var(--primary)" }}
            >
                Examples
            </h3>
            <ul className="list-inside list-disc">
                {exampleTracks.map((exampleTrack, indexI) => (
                    <li key={indexI} className="mb-4">
                        {exampleTrack.artistAndName}
                        <div className="text-gray-400 ml-4">
                            {exampleTrack.notes.map((note, indexJ) => (
                                <p key={indexJ}>{note}</p>
                            ))}
                            <p>
                                <button
                                    // Format
                                    type="button"
                                    className="px-2 py-0.5 mr-2 text-white bg-teal-800 hover:bg-teal-600 cursor-pointer"
                                    onClick={(event) => copyToClipboard(exampleTrack.spotifyLink, event)}
                                >
                                    copy
                                </button>
                                <code className="text-blue-300 hover:underline">
                                    <a href={exampleTrack.spotifyLink} target="_blank">
                                        {exampleTrack.spotifyLink}
                                    </a>
                                </code>
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
