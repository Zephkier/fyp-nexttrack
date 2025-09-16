"use client";

export default function PopularitySection({
    // Format
    incomingPopularity,
    selectedPopularityValue,
    onChange,
}: {
    incomingPopularity: number;
    selectedPopularityValue: number;
    onChange: (value: number) => void;
}) {
    return (
        <div
            // Format
            className="mb-4 p-4"
            style={{ background: "var(--secondary)" }}
        >
            <h4 className="mb-1 text-xl font-bold">Max Popularity</h4>
            <p className="mb-2">
                <b>Current:</b> {incomingPopularity}%
                <br />
                <b>Recommendation&apos;s max popularity:</b> {selectedPopularityValue}%
            </p>
            <input
                // Format
                className="w-full"
                type="range"
                min="0"
                max="100"
                step="1"
                value={selectedPopularityValue}
                onChange={(event) => onChange(Number(event.target.value))}
            />
        </div>
    );
}
