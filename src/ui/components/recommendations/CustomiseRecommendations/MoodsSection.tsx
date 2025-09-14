"use client";

export default function MoodsSection({
    // Format
    moods,
    incomingMoods,
    selectedMoods,
    onChange,
}: {
    moods: string[];
    incomingMoods: string[];
    selectedMoods: string[];
    onChange: (mood: string) => void;
}) {
    function titleCase(incomingString: string) {
        const firstLetter = incomingString.charAt(0).toUpperCase();
        const restOfTheLetters = incomingString.slice(1);
        return `${firstLetter}${restOfTheLetters}`;
    }

    return (
        <div
            // Format
            className="mb-4 p-4"
            style={{ background: "var(--secondary)" }}
        >
            <h4 className="mb-1 text-xl font-bold">Mood(s)</h4>
            <p className="mb-2">
                <b>Current:</b> {incomingMoods.join(", ")}%
                <br />
                <b>Recommended track&apos;s mood(s):</b>
            </p>
            {moods.map((mood) => (
                <label key={mood} className="flex w-fit space-x-2">
                    <input
                        type="checkbox"
                        checked={selectedMoods.includes(mood)}
                        /**
                         * Not using `setSelectedMoods(mood)` as it is checkboxes (i.e. array of selected moods).\
                         * If it was radio buttons that only allows 1 selection, then can use `setSelectedMoods(mood)`.
                         */
                        onChange={() => onChange(mood)}
                    />
                    <span>{titleCase(mood)}</span>
                </label>
            ))}
        </div>
    );
}
