export default function ButtonToSubmitSpotifyTrackLink({
    // Format
    margin,
    colour,
    type,
    onClick,
    buttonText,
}: {
    margin: string;
    colour: string;
    type: "button" | "submit";
    onClick: () => void;
    buttonText: string;
}) {
    return (
        <button
            // Format
            className={`px-4 py-2 ${margin} text-white bg-${colour}-800 hover:bg-${colour}-600 cursor-pointer`}
            type={type}
            onClick={onClick}
        >
            {buttonText}
        </button>
    );
}
