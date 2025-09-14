"use client";

/**
 * This is a string of `"yyyy-mm-dd"`. Example:
 *
 * ```js
 * new Date() //        *has many built-in methods*
 *     .toISOString() // e.g. "2025-09-14T11:51:49.079Z"
 *     .slice(0, 10); // e.g. "2025-09-14"
 * ```
 */
export const currentDate = new Date().toISOString().slice(0, 10);

export default function ReleaseDateRangeSection({
    // Format
    incomingReleaseDate,
    releaseDateFrom,
    releaseDateTo,
    onChangeFrom,
    onChangeTo,
}: {
    incomingReleaseDate: string;
    releaseDateFrom: string;
    releaseDateTo: string;
    onChangeFrom: (value: string) => void;
    onChangeTo: (value: string) => void;
}) {
    return (
        <div
            // Format
            className="mb-4 p-4"
            style={{ background: "var(--secondary)" }}
        >
            <h4 className="mb-1 text-xl font-bold">Release Date Range</h4>
            <p className="mb-4">
                <b>Current (yyyy-mm-dd):</b> {incomingReleaseDate}
                <br />
                <b>Recommended track&apos;s release date range:</b>
            </p>

            {/* Preset buttons */}
            <div className="mb-2 flex flex-wrap gap-2">
                <button
                    className="px-2 py-1 border hover:bg-green-600 cursor-pointer"
                    type="button"
                    onClick={() => {
                        onChangeFrom("");
                        onChangeTo(currentDate);
                    }}
                >
                    All time
                </button>
                <button
                    className="px-2 py-1 border hover:bg-green-600 cursor-pointer"
                    type="button"
                    onClick={() => {
                        const date = new Date();
                        const currentYear = date.getFullYear();
                        const fiveYearsAgo = currentYear - 5;
                        date.setFullYear(fiveYearsAgo);
                        onChangeFrom(date.toISOString().slice(0, 10));
                        onChangeTo(currentDate);
                    }}
                >
                    Past 5 years
                </button>
                <button
                    className="px-2 py-1 border hover:bg-green-600 cursor-pointer"
                    type="button"
                    onClick={() => {
                        const date = new Date();
                        const currentYear = date.getFullYear();
                        const oneYearAgo = currentYear - 1;
                        date.setFullYear(oneYearAgo);
                        onChangeFrom(date.toISOString().slice(0, 10));
                        onChangeTo(currentDate);
                    }}
                >
                    Past 1 year
                </button>
            </div>

            {/* "From/To" text and date inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2">
                <label className="flex flex-col">
                    <p className="mb-1">From (dd-mm-yyyy):</p>
                    <input
                        // Format
                        className="mb-1 px-2 py-1 border w-fit"
                        type="date"
                        value={releaseDateFrom}
                        max={releaseDateTo}
                        onChange={(event) => onChangeFrom(event.target.value)}
                    />
                    <p className="text-xs text-gray-400 italic">Leave blank for no date range</p>
                </label>
                <label className="flex flex-col">
                    <p className="mb-1">To (dd-mm-yyyy):</p>
                    <input
                        // Format
                        className="mb-1 px-2 py-1 border w-fit"
                        type="date"
                        value={releaseDateTo}
                        min={releaseDateFrom}
                        max={currentDate}
                        onChange={(event) => onChangeTo(event.target.value)}
                    />
                    <p className="text-xs text-gray-400 italic">Defaults to today</p>
                </label>
            </div>
        </div>
    );
}
