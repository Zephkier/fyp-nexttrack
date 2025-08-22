import SpotifyWebApi from "spotify-web-api-node";

/**
 * Creates a new instance of `SpotifyWebApi()` via variables from `./.env` file.
 *
 * Sets an access token.
 *
 * Returns the `SpotifyWebApi()` instance.
 */
export async function getSpotifyApiToken() {
    const spotifyApi = new SpotifyWebApi({
        // Key MUST be named "clientId" and not "clientID" or anything else
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });
    const data = await spotifyApi.clientCredentialsGrant();
    const accessToken = data.body.access_token;
    spotifyApi.setAccessToken(accessToken);
    return spotifyApi;
}

/**
 * Returns an object with many keys. Example:
 * ```
    {
        album: {
            album_type: 'album',
            artists: [ [Object], [Object] ],
            available_markets: [...],
            external_urls: { spotify: 'https://open.spotify.com/album/5v7xYJyke25Nmt3l2R7YkR' },
            href: 'https://api.spotify.com/v1/albums/5v7xYJyke25Nmt3l2R7YkR',
            id: '5v7xYJyke25Nmt3l2R7YkR',
            images: [ [Object], [Object], [Object] ],
            name: 'I Said I Love You First',
            release_date: '2025-03-21',
            release_date_precision: 'day',
            total_tracks: 14,
            type: 'album',
            uri: 'spotify:album:5v7xYJyke25Nmt3l2R7YkR'
        },
        artists: [
            {
                external_urls: [Object],
                href: 'https://api.spotify.com/v1/artists/0C8ZW7ezQVs4URX5aX7Kqx',
                id: '0C8ZW7ezQVs4URX5aX7Kqx',
                name: 'Selena Gomez',
                type: 'artist',
                uri: 'spotify:artist:0C8ZW7ezQVs4URX5aX7Kqx'
            },
            {
                external_urls: [Object],
                href: 'https://api.spotify.com/v1/artists/5CiGnKThu5ctn9pBxv7DGa',
                id: '5CiGnKThu5ctn9pBxv7DGa',
                name: 'benny blanco',
                type: 'artist',
                uri: 'spotify:artist:5CiGnKThu5ctn9pBxv7DGa'
            },
            {
                external_urls: [Object],
                href: 'https://api.spotify.com/v1/artists/2sSGPbdZJkaSE2AbcGOACx',
                id: '2sSGPbdZJkaSE2AbcGOACx',
                name: 'The Marías',
                type: 'artist',
                uri: 'spotify:artist:2sSGPbdZJkaSE2AbcGOACx'
            }
        ],
        available_markets: [...],
        disc_number: 1,
        duration_ms: 201920,
        explicit: false,
        external_ids: { isrc: 'USUG12408959' },
        external_urls: { spotify: 'https://open.spotify.com/track/1DFmBjoeQN9DpOVTEewyx0' },
        href: 'https://api.spotify.com/v1/tracks/1DFmBjoeQN9DpOVTEewyx0',
        id: '1DFmBjoeQN9DpOVTEewyx0',
        is_local: false,
        name: 'Ojos Tristes (with The Marías)',
        popularity: 75,
        preview_url: null,
        track_number: 4,
        type: 'track',
        uri: 'spotify:track:1DFmBjoeQN9DpOVTEewyx0'
    }
 * ```
 */
export async function getSpotifyTrackDetails(trackId: string) {
    const api = await getSpotifyApiToken();
    const response = await api.getTrack(trackId);
    return response.body;
}
