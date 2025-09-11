/**
 * Set as `export const` so other files can import it for consistency.
 *
 * Currently contains:
 *
 * ```js
 * ["happy", "sad", "chill", "party"]
 * ```
 */
export const moods = ["happy", "sad", "chill", "party"];

/**
 * The mapping for a genre to its mood(s) and weight(s). Example:
 *
 * ```js
 * "neo-soul": [
 *     { mood: moods[1], weight: 1 },
 *     { mood: moods[2], weight: 2 },
 * ],
 * ```
 *
 * Note:
 *
 * - `mood` is based on `export const moods`.
 * - `weight` has values 1, 2, 3.
 *
 * Additional note:
 *
 * - This variable **does not** contain every user-generated genre in Last.fm and Genius.
 * - You (the developer) must manually add new genres into it.
 * - It is recommended to sort and group by similar genres.
 */
export const genreToMoodMapping: {
    [key: string]: {
        mood: string;
        weight: number;
    }[];
} = {
    pop: [
        { mood: moods[0], weight: 2 },
        { mood: moods[3], weight: 3 },
    ],
    "bedroom pop": [{ mood: moods[2], weight: 3 }],
    "dream pop": [{ mood: moods[2], weight: 3 }],
    "sunshine pop": [
        { mood: moods[0], weight: 3 },
        { mood: moods[2], weight: 3 },
        { mood: moods[3], weight: 1 },
    ],
    "indie pop": [
        { mood: moods[2], weight: 3 },
        { mood: moods[3], weight: 1 },
    ],
    indie: [{ mood: moods[2], weight: 2 }],

    hiphop: [
        { mood: moods[2], weight: 1 },
        { mood: moods[3], weight: 2 },
    ],
    "hip hop": [
        { mood: moods[2], weight: 1 },
        { mood: moods[3], weight: 2 },
    ],
    "hip-hop": [
        { mood: moods[2], weight: 1 },
        { mood: moods[3], weight: 2 },
    ],

    rap: [{ mood: moods[3], weight: 2 }],
    "jazz rap": [{ mood: moods[2], weight: 2 }],

    rnb: [
        { mood: moods[2], weight: 2 },
        { mood: moods[3], weight: 2 },
    ],
    "r&b": [
        { mood: moods[2], weight: 2 },
        { mood: moods[3], weight: 2 },
    ],

    soul: [
        { mood: moods[1], weight: 1 },
        { mood: moods[2], weight: 2 },
    ],
    soulful: [
        { mood: moods[1], weight: 1 },
        { mood: moods[2], weight: 2 },
    ],
    "neo-soul": [
        { mood: moods[1], weight: 1 },
        { mood: moods[2], weight: 2 },
    ],
    jazz: [
        { mood: moods[0], weight: 1 },
        { mood: moods[2], weight: 3 },
    ],
    blues: [
        { mood: moods[1], weight: 3 },
        { mood: moods[2], weight: 1 },
    ],

    rock: [
        { mood: moods[0], weight: 1 },
        { mood: moods[3], weight: 2 },
    ],
    "hard rock": [{ mood: moods[3], weight: 3 }],
    "classic rock": [
        { mood: moods[0], weight: 1 },
        { mood: moods[3], weight: 3 },
    ],
    "alternative rock": [
        { mood: moods[0], weight: 2 },
        { mood: moods[2], weight: 2 },
    ],
    "alternate rock": [
        { mood: moods[0], weight: 2 },
        { mood: moods[2], weight: 2 },
    ],
    "psychedelic rock": [
        { mood: moods[2], weight: 3 },
        { mood: moods[3], weight: 1 },
    ],

    metal: [{ mood: moods[3], weight: 3 }],
    "heavy metal": [{ mood: moods[3], weight: 3 }],

    edm: [{ mood: moods[3], weight: 3 }],
    electronic: [{ mood: moods[3], weight: 3 }],
    dance: [{ mood: moods[3], weight: 3 }],
    dubstep: [{ mood: moods[3], weight: 3 }],
    house: [{ mood: moods[3], weight: 3 }],
    techno: [{ mood: moods[3], weight: 3 }],
    trap: [{ mood: moods[3], weight: 3 }],
    dnb: [{ mood: moods[3], weight: 3 }],
    "drum and bass": [{ mood: moods[3], weight: 3 }],
    "future bass": [{ mood: moods[3], weight: 3 }],

    lofi: [{ mood: moods[2], weight: 3 }],
    "lo-fi": [{ mood: moods[2], weight: 3 }],

    alternative: [{ mood: moods[2], weight: 2 }],
    uplifting: [{ mood: moods[0], weight: 3 }],
    rage: [{ mood: moods[3], weight: 3 }],
    surf: [
        { mood: moods[0], weight: 2 },
        { mood: moods[2], weight: 2 },
    ],
};

/**
 * Helper function returns `[]` or an array of strings. Example:
 *
 * - If `numberOfMoodsToGet = 2`, then returns `[ "mood1", "mood2" ]`.
 * - If `numberOfMoodsToGet = 4`, then returns `[ "mood1", ..., "mood4" ]`.
 *
 * ---
 *
 * This is a very manual and rudimentary implementation.
 *
 * Max `numberOfMoodsToGet` is based on `moods.length`.
 *
 * Ensure moods are the same as `./src/ui/components/CustomiseRecommendations.ts::allMoods`.
 */
export function inferMoodsFromGenres(genres: string[], numberOfMoodsToGet: number) {
    if (numberOfMoodsToGet > moods.length) {
        console.error(`[!] ./src/libs/mood.ts::inferMoodsFromGenres():\nMax value allowed for "numberOfMoodsToGet" is ${moods.length} (current: ${numberOfMoodsToGet}).`);
        return [];
    }
    /**
     * This will eventually become something like:
     *
     * ```js
     * { chill: 9, party: 2, happy: 3 }
     * ```
     *
     * Where...
     *
     * - The key is the `mood` (based on `genreToMoodMapping`).
     * - The value is the sum of that `mood`'s `weight`.
     */
    const summedMappingObject: { [mood: string]: number } = {};
    // Iterate through track's genres
    for (const genre of genres) {
        /**
         * Returns either `undefined` or an array of mapping. Example:
         *
         * ```js
         * [
         *     { mood: 'happy', weight: 3 },
         *     { mood: 'chill', weight: 3 },
         *     { mood: 'party', weight: 1 }
         * ]
         * ```
         */
        const mapping = genreToMoodMapping[genre];
        // Continue even if one of track's genre did not match anything in `genreToMoodMapping`
        if (!mapping) continue;
        // Iterate through genre's mappings to sum its mood's weight
        for (const { mood, weight } of mapping) {
            if (!summedMappingObject[mood]) summedMappingObject[mood] = 0;
            summedMappingObject[mood] += weight;
        }
    }
    /**
     * Convert from an object to an array. Example:
     *
     * ```js
     * // From (as per above):
     * { chill: 9, party: 2, happy: 3 }
     *
     * // To:
     * [ [ 'chill', 9 ], [ 'party', 2 ], [ 'happy', 3 ] ]
     * ```
     */
    const summedMappingArray = Object.entries(summedMappingObject);
    // When all of track's genres did not match anything in `genreToMoodMapping`
    if (summedMappingArray.length == 0) return [];
    /**
     * Sorts by weight, then return the top `numberOfMoodsToGet` (e.g. 2) moods. Example:
     *
     * ```js
     * // From (as per above):
     * [ [ 'chill', 9 ], [ 'party', 2 ], [ 'happy', 3 ] ]
     *
     * // To:
     * [ [ 'chill', 9 ], [ 'happy', 3 ], [ 'party', 2 ] ]
     *
     * // To:
     * [ 'chill', 'happy', 'party' ]
     *
     * // To:
     * [ 'chill', 'happy' ]
     * ```
     */
    const inferredMoods = summedMappingArray
        .sort((a, b) => b[1] - a[1])
        .map(([mood]) => mood)
        .slice(0, numberOfMoodsToGet);
    return inferredMoods;
}
