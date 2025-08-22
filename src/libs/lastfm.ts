/**
 * Returns an array of objects with `name` and `url` keys. Example:
 *
 * ```
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
     * ```
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
