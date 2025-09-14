"use client";

export default function GenresSection({
    // Format
    incomingGenres,
    selectedGenresSimilarityValue,
    onChange,
}: {
    incomingGenres: string[];
    selectedGenresSimilarityValue: number;
    onChange: (value: number) => void;
}) {
    return (
        <div
            // Format
            className="mb-4 p-4"
            style={{ background: "var(--secondary)" }}
        >
            <h4 className="mb-1 text-xl font-bold">Genres</h4>
            <p className="mb-2">
                <b>Current:</b> {incomingGenres.join(", ")}
                <br />
                <b>Recommended track&apos;s similarity:</b> {selectedGenresSimilarityValue}%
            </p>
            <input
                // Format
                className="w-full"
                type="range"
                min="0"
                max="100"
                step="1"
                value={selectedGenresSimilarityValue}
                onChange={(event) => onChange(Number(event.target.value))}
            />
        </div>
    );
}
