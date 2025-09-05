/**
 * Ensure moods are the same as `./src/ui/components/CustomiseRecommendations.ts::allMoods`.
 *
 * - `mood`: "happy", "sad", "chill", "party"
 * - `weight`: 1, 2, 3
 */
const genreToMoodMapping: { [key: string]: { mood: string; weight: number }[] } = {
    // ------------- //
    // Common genres //
    // ------------- //
    pop: [
        { mood: "happy", weight: 3 },
        { mood: "party", weight: 2 },
    ],

    hiphop: [
        { mood: "chill", weight: 1 },
        { mood: "party", weight: 2 },
    ],
    "hip hop": [
        { mood: "chill", weight: 1 },
        { mood: "party", weight: 2 },
    ],
    "hip-hop": [
        { mood: "chill", weight: 1 },
        { mood: "party", weight: 2 },
    ],

    rap: [{ mood: "party", weight: 2 }],
    "jazz rap": [{ mood: "chill", weight: 2 }],

    rnb: [
        { mood: "chill", weight: 2 },
        { mood: "party", weight: 2 },
    ],
    "r&b": [
        { mood: "chill", weight: 2 },
        { mood: "party", weight: 2 },
    ],

    soul: [
        { mood: "sad", weight: 1 },
        { mood: "chill", weight: 2 },
    ],
    soulful: [
        { mood: "sad", weight: 1 },
        { mood: "chill", weight: 2 },
    ],

    rock: [
        { mood: "happy", weight: 1 },
        { mood: "party", weight: 2 },
    ],
    "hard rock": [{ mood: "party", weight: 3 }],
    "classic rock": [
        { mood: "happy", weight: 2 },
        { mood: "party", weight: 3 },
    ],
    "alternative rock": [
        { mood: "happy", weight: 2 },
        { mood: "chill", weight: 1 },
    ],

    metal: [{ mood: "party", weight: 3 }],
    "heavy metal": [{ mood: "party", weight: 3 }],

    edm: [{ mood: "party", weight: 3 }],
    electronic: [{ mood: "party", weight: 3 }],
    dance: [{ mood: "party", weight: 3 }],
    house: [{ mood: "party", weight: 3 }],
    techno: [{ mood: "party", weight: 3 }],
    dubstep: [{ mood: "party", weight: 3 }],
    trap: [{ mood: "party", weight: 3 }],
    dnb: [{ mood: "party", weight: 3 }],
    "drum and bass": [{ mood: "party", weight: 3 }],

    jazz: [
        { mood: "happy", weight: 1 },
        { mood: "chill", weight: 3 },
    ],
    blues: [
        { mood: "sad", weight: 3 },
        { mood: "chill", weight: 1 },
    ],

    // --------------- //
    // Uncommon genres //
    // --------------- //
    indie: [{ mood: "chill", weight: 3 }],
    "indie pop": [
        { mood: "happy", weight: 1 },
        { mood: "sad", weight: 1 },
        { mood: "chill", weight: 3 },
    ],
    "bedroom pop": [
        { mood: "happy", weight: 1 },
        { mood: "sad", weight: 1 },
        { mood: "chill", weight: 3 },
    ],
    "dream pop": [
        { mood: "happy", weight: 1 },
        { mood: "sad", weight: 1 },
        { mood: "chill", weight: 3 },
    ],
    "sunshine pop": [
        { mood: "happy", weight: 3 },
        { mood: "chill", weight: 3 },
    ],

    alternative: [{ mood: "chill", weight: 2 }],
    rage: [{ mood: "party", weight: 3 }],
    surf: [
        { mood: "happy", weight: 2 },
        { mood: "chill", weight: 2 },
    ],
    uplifting: [{ mood: "happy", weight: 3 }],

    lofi: [{ mood: "chill", weight: 3 }],
    "lo-fi": [{ mood: "chill", weight: 3 }],
};

/**
 * Returns an array of strings. Example:
 *
 * - If `numberOfMoodsToRetrieve = 2`, then returns `[ "mood1", "mood2" ]`.
 * - If `numberOfMoodsToRetrieve = 4`, then returns `[ "mood1", ..., "mood4" ]`.
 *
 * ---
 *
 * This is a very manual and rudimentary implementation.
 *
 * Max `numberOfMoodsToRetrieve` is 4 because there are only 4 moods ("happy", "sad", "chill", "party").
 *
 * Ensure moods are the same as `./src/ui/components/CustomiseRecommendations.ts::allMoods`.
 */
export function inferMoodsFromGenres(genres: string[], numberOfMoodsToRetrieve: number) {
    const overallMoodsAndWeights: { [key: string]: number } = {};

    for (const genre of genres) {
        /**
         * Returns `undefined` (for non-matching genre) or an array of object(s) (for matching genre). Example:
         * ```js
            [
                { mood: 'happy', weight: 1 },
                { mood: 'sad',   weight: 1 },
                { mood: 'chill', weight: 3 }
            ]
         * ```
         */
        const mapping = genreToMoodMapping[genre];
        if (!mapping) continue;
        // Add up every mood's weights
        for (const { mood, weight } of mapping) {
            if (!overallMoodsAndWeights[mood]) overallMoodsAndWeights[mood] = 0;
            overallMoodsAndWeights[mood] += weight;
        }
    }

    /**
     * Returns an array of arrays. Example:
     * ```js
        [
            [ 'happy', 2 ],
            [ 'sad',   2 ],
            [ 'chill', 6 ]
        ]
     * ```
     */
    const moodsAndWeights = Object.entries(overallMoodsAndWeights);

    // When track's genres did not match anything in "genreToMoodMapping"
    if (moodsAndWeights.length == 0) return [];

    /**_Same JSDoc as this function._ */
    const sorted = moodsAndWeights
        // Sort by weight, which is at index 1
        .sort((a, b) => b[1] - a[1])
        // Keep only the mood's name
        .map(([mood]) => mood)
        // Keep only the top few moods
        .slice(0, numberOfMoodsToRetrieve);

    return sorted;
}
