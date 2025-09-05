import * as cheerio from "cheerio";

function authHeaders(): HeadersInit {
    const clientAccessToken = process.env.GENIUS_CLIENT_ACCESS_TOKEN;
    if (!clientAccessToken) {
        console.error('[!] ./src/libs/genius.ts::authHeaders():\nNo "GENIUS_CLIENT_ACCESS_TOKEN"');
        return {};
    }
    return { Authorization: `Bearer ${clientAccessToken}` };
}

async function getGeniusSearchFirstItem(trackArtistAndName: string) {
    const encodedTrackArtistAndName = encodeURIComponent(trackArtistAndName);
    const response = await fetch(`https://api.genius.com/search?q=${encodedTrackArtistAndName}`, {
        headers: authHeaders(),
        cache: "no-store",
    });

    if (!response.ok) {
        console.error("[!] ./src/libs/genius.ts::getGeniusSearch()");
        return null;
    }

    const data = await response.json();
    const firstItem = data.response.hits[0];
    return firstItem;
}
/**
 * Web scraping returns `[]` or an array of strings. Example:
 * 
 * `["genre1", "genre2"]`
 * 
 * ---
 * 
 * Source:
 * - https://genius.com/Dimitri-vegas-and-like-mike-tiesto-dido-and-w-w-thank-you-not-so-bad-lyrics
 * - https://genius.com/Nujabes-luvsic-grand-finale-lyrics
 * 
 * In a track's Genius page, the HTML element containing genres is:
 * ```html
    <!--
    The class names have the same weird strings consistently:
    - "b55131f0-1 SEhjw"
    - "b55131f0-2 hYXsrC"
    - "b55131f0-2 bZuDYa"
    -->
    <div class="SongTags__Container-sc-b55131f0-1 SEhjw">
        <a class="SongTags__Tag-sc-b55131f0-2 hYXsrC" ...>Electronic</a>
        <a class="SongTags__Tag-sc-b55131f0-2 bZuDYa" ...>EDM</a>
    </div>
 * ```
 */
export async function webScrapeGeniusGenres(trackArtistAndName: string) {
    const firstItem = await getGeniusSearchFirstItem(trackArtistAndName);
    const geniusUrl = firstItem.result.url;
    try {
        const response = await fetch(geniusUrl, {
            // Avoid being detected as a bot TODO Change to "+https://fyp-nexttrack.vercel.app/"
            headers: { "User-Agent": "NextTrack/1.0 (+https://example.com)" },
            cache: "no-store",
        });
        if (!response.ok) return [];
        // Parse HTML using Cheerio
        const html = await response.text();
        const $ = cheerio.load(html);
        // Extract text from specified HTML element
        const htmlElement1 = "div.SongTags__Container-sc-b55131f0-1";
        const htmlElement2 = "a.SongTags__Tag-sc-b55131f0-2";
        const selector = $(`${htmlElement1} ${htmlElement2}`);
        const genres = selector
            // Must iterate as there are multiple genres
            .map((index, htmlElement) => $(htmlElement).text().trim().toLowerCase())
            .get();
        return genres;
    } catch (err) {
        console.error(`[!] ./src/libs/genius.ts::webScrapeGeniusGenres():\n${err}`);
        return [];
    }
}
