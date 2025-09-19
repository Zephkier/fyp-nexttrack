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
    const colourMap: {
        [colour: string]: string;
    } = {
        green: "bg-green-800 hover:bg-green-600",
        red: "bg-red-800 hover:bg-red-600",
    };

    return (
        <button
            // Format
            className={`px-4 py-2 ${margin} text-white ${colourMap[colour]} cursor-pointer`}
            type={type}
            onClick={onClick}
        >
            {buttonText}
        </button>
    );
}
