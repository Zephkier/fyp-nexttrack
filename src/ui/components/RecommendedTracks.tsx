import RecommendedTrackItself from "./RecommendedTrackItself";

type RecommendedTrackProps = Parameters<typeof RecommendedTrackItself>[0]["recommendedTrack"];

export default function RecommendedTracks({ recommendedTracks }: { recommendedTracks: RecommendedTrackProps[] }) {
    return (
        <section>
            <h3
                // Format
                className="text-2xl font-bold mb-2"
                style={{ color: "var(--primary)" }}
            >
                Recommended Tracks
            </h3>
            {recommendedTracks.length == 0 ? (
                <p className="items-center  text-gray-400 italic">
                    {/* Handle cases where there are no recommended tracks */}
                    No recommended tracks found...
                </p>
            ) : (
                <div className="space-y-4">
                    {recommendedTracks.map((recommendedTrack, index) => (
                        <RecommendedTrackItself key={index} recommendedTrack={recommendedTrack} />
                    ))}
                </div>
            )}
        </section>
    );
}
