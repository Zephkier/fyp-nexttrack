import * as cheerio from "cheerio";

/**
 * Returns an array of objects with `name` and `url` keys. Example:
 *
 * ```json
    [
        { name: 'Espanol',      url: 'https://www.last.fm/tag/Espanol'      },
        { name: 'indie pop',    url: 'https://www.last.fm/tag/indie+pop'    },
        { name: 'sunshine pop', url: 'https://www.last.fm/tag/sunshine+pop' },
        { name: 'bedroom pop',  url: 'https://www.last.fm/tag/bedroom+pop'  },
        { name: 'The Marias',   url: 'https://www.last.fm/tag/The+Marias'   }
    ]
 * ```
 */
export async function getLastFmGenres(artistName: string, trackName: string) {
    // From https://www.last.fm/api/show/track.getInfo
    const baseUrl = "http://ws.audioscrobbler.com";

    // Could have used "track.getTopTags", but this offers more info if ever needed
    const method = "track.getInfo";
    const apiKey = process.env.LASTFM_API_KEY;

    // TEST Original
    // const fullUrl = `${baseUrl}/2.0/?method=${method}&api_key=${apiKey}&artist=${encodeURI(artistName)}&track=${encodeURI(trackName)}&format=json`;

    // TEST I want to test without "encodeURI()"
    // const fullUrl = `${baseUrl}/2.0/?method=${method}&api_key=${apiKey}&artist=${artistName}&track=${trackName}&format=json`;

    // TEST I want to test with "autocorrect=1"
    const fullUrl = `${baseUrl}/2.0/?method=${method}&api_key=${apiKey}&artist=${artistName}&track=${trackName}&autocorrect=1&format=json`;

    const response = await fetch(fullUrl);
    if (!response.ok) return [];

    /**
     * Returns an object with many keys. Example:
     * ```json
        {
            track: {
                name: 'Ojos Tristes (with The Marías)',
                url: 'https://www.last.fm/music/Selena+Gomez/_/Ojos+Tristes+(with+The+Mar%C3%ADas)',
                duration: '0',
                streamable: { '#text': '0', fulltrack: '0' },
                listeners: '315774',
                playcount: '2663349',
                artist: { name: 'Selena Gomez', url: 'https://www.last.fm/music/Selena+Gomez' },
                    toptags: { tag: [Array] },
                    wiki: {
                        published: '26 May 2025, 22:04',
                        summary: 'From... tristes”.\n' + '\n' + '“Ojos... Read more on Last.fm</a>.',
                        content: 'From... tristes”.\n' + '\n' + '“Ojos... painful.\n' + 'The... terms may apply.'
                    }
            }
        }
     * ```
     */
    const data = await response.json();

    /**
     * _Same JSDoc as this function._
     */
    const genres = data.track.toptags.tag;

    return genres;
}

/**
 * Returns an array of objects with many keys. Example:
 *
 * ```json
    [
        {
            "name": "Ojos Tristes",
            "playcount": 269596,
            "mbid": "c602cfae-f290-4ce7-a1b9-fcda91292862",
            "match": 1.0,
            "url": "https://www.last.fm/music/Selena+Gomez/_/Ojos+Tristes",
            "streamable": { "#text": "0", "fulltrack": "0" },
            "duration": 201,
            "artist": {
                "name": "Selena Gomez",
                "mbid": "e4bc69e2-a064-4f93-ada1-f7f209cc1cc3",
                "url": "https://www.last.fm/music/Selena+Gomez"
            },
            "image": [...]
        }, 
        ...
    ]
 * ```
 */
export async function getLastFmSimilarTracks(artistName: string, trackName: string) {
    // From https://www.last.fm/api/show/track.getSimilar
    const baseUrl = "http://ws.audioscrobbler.com";
    const method = "track.getSimilar";
    const apiKey = process.env.LASTFM_API_KEY;
    const fullUrl = `${baseUrl}/2.0/?method=${method}&artist=${artistName}&track=${trackName}&api_key=${apiKey}&format=json`;

    const response = await fetch(fullUrl);
    if (!response.ok) return [];

    /**
     * Returns an object of an object. Example:
     * ```js
        {
            similartracks: {
                track: [ [Object], ..., [Object] ], // Has 100x [Object]
                '@attr': { artist: 'Selena Gomez', track: 'Ojos Tristes (with The Marías)' }
            }
        }
     * ```
     */
    const data = await response.json();

    /**
     * _Same JSDoc as this function._
     */
    const similarTracks = data.similartracks.track;

    return similarTracks;
}

/**
 * On Last.fm's page, the HTML element containing its YouTube video is:
 * ```html
    <a
        id="track-page-video-playlink"
        href="https://www.youtube.com/watch?v=Ch6xdV_ZjdU"
        data-youtube-id="Ch6xdV_ZjdU"
        data-youtube-url="https://www.youtube.com/watch?v=Ch6xdV_ZjdU"
        ...
    ></a>
 * ```
 *
 * It web scraps and returns the value of `data-youtube-id`. Example:
 * 
 * `"Ch6xdV_ZjdU"`
 */
export async function getLastFmYoutubeId(lastFmUrl: string) {
    try {
        const response = await fetch(lastFmUrl, {
            // Avoid being detected as a bot
            headers: { "User-Agent": "NextTrack/1.0 (+https://example.com)" },
            cache: "no-store",
        });
        if (!response.ok) return null;

        const html = await response.text();
        const $ = cheerio.load(html);

        // Select the HTML element via its "id" attribute, and then the desired attribute (i.e. data-youtube-id)
        let youtubeId = $("#track-page-video-playlink").attr("data-youtube-id");

        return youtubeId;
    } catch {
        return null;
    }
}
