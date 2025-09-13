"use client";

/**
 * `type` is more flexible and has more use cases than `interface`.\
 * Better to set this in child, and have parent import it.
 */
export type exampleTrackType = {
    artistAndName: string;
    notes: string[];
    spotifyLink: string;
};

async function copyToClipboard(event: React.MouseEvent<HTMLButtonElement>, text: string) {
    const button = event.currentTarget;
    await navigator.clipboard.writeText(text);
    button.innerText = "Copied!";
    setTimeout(
        // Format
        () => (button.innerText = "Copy"),
        1000
    );
}

export default function Example({ exampleTrack }: { exampleTrack: exampleTrackType }) {
    return (
        <li className="mb-4">
            {exampleTrack.artistAndName}
            <div className="text-gray-400 ml-4">
                {exampleTrack.notes.map((note, index) => (
                    <p key={index}>{note}</p>
                ))}
                <p>
                    <button
                        // Format
                        className="px-2 py-0.5 mr-2 text-white bg-teal-800 hover:bg-teal-600 cursor-pointer"
                        type="button"
                        onClick={(event) => copyToClipboard(event, exampleTrack.spotifyLink)}
                    >
                        Copy
                    </button>
                    <code className="text-blue-300 hover:underline">
                        <a href={exampleTrack.spotifyLink} target="_blank">
                            {exampleTrack.spotifyLink}
                        </a>
                    </code>
                </p>
            </div>
        </li>
    );
}
