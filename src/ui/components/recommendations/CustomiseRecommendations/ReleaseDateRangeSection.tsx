"use client";

export default function ReleaseDateRangeSection({
    // Format
    incomingReleaseDate,
    selectedReleaseDateRange,
    onChange,
}: {
    incomingReleaseDate: string;
    selectedReleaseDateRange: number;
    onChange: (value: number) => void;
}) {
    return (
        <div
            // Format
            className="mb-4 p-4"
            style={{ background: "var(--secondary)" }}
        >
            <h4 className="mb-1 text-xl font-bold">Release Date Range (Y-M-D)</h4>
            <p className="mb-2">
                <b>Current:</b> {incomingReleaseDate}
                <br />
                <b>Recommended track&apos;s release date:</b> {selectedReleaseDateRange}
            </p>
            <input
                // Format
                className="w-full"
                type="range"
                min="1800"
                max="2025"
                step="1"
                value={selectedReleaseDateRange}
                onChange={(event) => onChange(Number(event.target.value))}
            />
        </div>
    );
}
