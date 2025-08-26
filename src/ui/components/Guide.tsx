export default function Guide() {
    return (
        <div className="mb-40">
            <h3
                // Format
                className="text-2xl font-bold mb-2"
                style={{ color: "var(--primary)" }}
            >
                Here&apos;s how you can get a link
            </h3>
            <ol className="mb-2 list-inside list-decimal">
                <li>Hover over your desired song on Spotify</li>
                <li>Right click</li>
                <li>Select &quot;Share&quot;</li>
                <li>Select &quot;Copy link to Song&quot;</li>
            </ol>
            <p className="italic text-gray-400">(GIF guides coming soon)</p>
        </div>
    );
}
