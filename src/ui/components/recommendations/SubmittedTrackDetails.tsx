/**
 * `type` is more flexible and has more use cases than `interface`.\
 * Better to set this in child, and have parent import it.
 */
export type submittedTrackType = {
    name: string;
    artists: string[];
    releaseDate: string;
    popularity: number;
    genres: string[];
    moods: string[];
};

export default function SubmittedTrackDetails({ submittedTrack }: { submittedTrack: submittedTrackType }) {
    return (
        <div className="mb-20">
            <h3 className="mb-2 text-2xl font-bold" style={{ color: "var(--primary)" }}>
                Submitted Track Details
            </h3>
            <ul>
                <li>
                    <b>Name:</b> {submittedTrack.name}
                </li>
                <li>
                    <b>Artist(s):</b> {submittedTrack.artists.join(", ")}
                </li>
                <li>
                    <b>Release Date (Y-M-D):</b> {submittedTrack.releaseDate}
                </li>
            </ul>
        </div>
    );
}
