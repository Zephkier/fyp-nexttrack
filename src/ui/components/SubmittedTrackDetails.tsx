// "type" is more flexible (allows for more use cases) than "interface"
type submittedTrackProp = {
    name: string;
    artists: string[];
    releaseDate: string;
    popularity: number;
    genres: string[];
    moods: string[];
};

export default function SubmittedTrackDetails({ submittedTrack }: { submittedTrack: submittedTrackProp }) {
    return (
        <div className="mb-20">
            <h3 className="text-2xl font-bold mb-2" style={{ color: "var(--primary)" }}>
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
                    <b>Release Date:</b> {submittedTrack.releaseDate}
                </li>
            </ul>
        </div>
    );
}
