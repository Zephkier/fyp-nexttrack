import RecommendedTrackItself from "./RecommendedTrackItself";

type RecommendedTrackProps = Parameters<typeof RecommendedTrackItself>[0]["recommendedTrack"];

export default function RecommendedTracks(
    // Format
    { recommendedTracks }: { recommendedTracks: RecommendedTrackProps[] }
) {
    return (
        <section>
            <h3
                // Format
                className="text-2xl font-bold mb-2"
                style={{ color: "var(--primary)" }}
            >
                Recommended Tracks
            </h3>
            <div className="space-y-4">
                {recommendedTracks.map((recommendedTrack, index) => (
                    <RecommendedTrackItself key={index} recommendedTrack={recommendedTrack} />
                ))}
            </div>
        </section>
    );
}
