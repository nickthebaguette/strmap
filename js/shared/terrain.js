// ============================================================
// TERRAIN.JS
// Terrain / physical geography system
// ============================================================
//
// Terrain is deliberately separate from map.js.
//
// map.js
//     → political ownership
//     → ocean / land
//     → grid dimensions
//
// terrain.js
//     → physical terrain
//     → terrain overrides
//     → terrain.json loading/exporting
//
// IMPORTANT:
//     terrain.js NEVER defines map dimensions itself.
//
//     map.js is the authority for COLS and ROWS.
//
// ============================================================


import {
    tiles,
    COLS,
    ROWS
} from "./map.js";


// ============================================================
// TERRAIN TYPES
// ============================================================

export const TERRAIN_TYPES = {

    plains: {

        name: "Plains",

        editable: true

    },


    forest: {

        name: "Forest",

        editable: true

    },


    hills: {

        name: "Hills",

        editable: true

    },


    mountains: {

        name: "Mountains",

        editable: true

    },


    desert: {

        name: "Desert",

        editable: true

    },


    swamp: {

        name: "Swamp",

        editable: true

    },


    water: {

        name: "Water",

        editable: false

    }

};


// ============================================================
// DEFAULT TERRAIN
// ============================================================
//
// Every non-ocean tile is plains unless an override exists.
//
// ============================================================

export const DEFAULT_TERRAIN =
    "plains";


// ============================================================
// TERRAIN OVERRIDES
// ============================================================
//
// Example:
//
// {
//     "42,31": "forest",
//     "43,31": "forest",
//     "50,40": "mountains"
// }
//
// Plains are not stored because plains are the default.
//
// ============================================================

const terrainOverrides = {};


// ============================================================
// TERRAIN KEY
// ============================================================

export function getTerrainKey(
    col,
    row
) {

    return `${col},${row}`;

}


// ============================================================
// VALIDATE COORDINATES
// ============================================================

function isValidCoordinate(
    col,
    row
) {

    return (

        Number.isInteger(col) &&

        Number.isInteger(row) &&

        col >= 0 &&

        col < COLS &&

        row >= 0 &&

        row < ROWS

    );

}


// ============================================================
// VALIDATE TERRAIN
// ============================================================

export function isValidTerrain(
    terrain
) {

    return Boolean(
        TERRAIN_TYPES[terrain]
    );

}


// ============================================================
// CHECK IF TERRAIN IS EDITABLE
// ============================================================

export function isTerrainEditable(
    terrain
) {

    return (

        isValidTerrain(terrain) &&

        TERRAIN_TYPES[
            terrain
        ].editable === true

    );

}


// ============================================================
// GET TERRAIN
// ============================================================
//
// Main terrain lookup.
//
// Usage:
//
//     getTerrain(tile)
//
// Behaviour:
//
//     ocean tile
//         → water
//
//     land tile with override
//         → override
//
//     land tile without override
//         → plains
//
// ============================================================

export function getTerrain(
    tile
) {

    if (
        !tile
    ) {

        return DEFAULT_TERRAIN;

    }


    // --------------------------------------------------------
    // OCEAN
    // --------------------------------------------------------
    //
    // Ocean ownership automatically determines water terrain.
    //
    // --------------------------------------------------------

    if (
        tile.owner === "ocean"
    ) {

        return "water";

    }


    // --------------------------------------------------------
    // LOOK FOR OVERRIDE
    // --------------------------------------------------------

    const key =
        getTerrainKey(
            tile.col,
            tile.row
        );


    const terrain =
        terrainOverrides[key];


    if (
        isValidTerrain(terrain) &&
        isTerrainEditable(terrain)
    ) {

        return terrain;

    }


    // --------------------------------------------------------
    // DEFAULT
    // --------------------------------------------------------

    return DEFAULT_TERRAIN;

}


// ============================================================
// GET TERRAIN BY COORDINATES
// ============================================================
//
// Convenience function.
//
// Usage:
//
//     getTerrainAt(42, 31)
//
// ============================================================

export function getTerrainAt(
    col,
    row
) {

    if (
        !isValidCoordinate(
            col,
            row
        )
    ) {

        return DEFAULT_TERRAIN;

    }


    const tile =
        tiles[
            row * COLS + col
        ];


    return getTerrain(
        tile
    );

}


// ============================================================
// SET TERRAIN
// ============================================================
//
// Used by the editor.
//
// Example:
//
//     setTerrain(tile, "forest");
//
// ============================================================

export function setTerrain(
    tile,
    terrain
) {

    if (
        !tile
    ) {

        return false;

    }


    // --------------------------------------------------------
    // Validate coordinates
    // --------------------------------------------------------

    if (
        !isValidCoordinate(
            tile.col,
            tile.row
        )
    ) {

        return false;

    }


    // --------------------------------------------------------
    // Validate terrain
    // --------------------------------------------------------

    if (
        !isValidTerrain(
            terrain
        )
    ) {

        console.warn(
            `Unknown terrain: ${terrain}`
        );

        return false;

    }


    // --------------------------------------------------------
    // Water cannot be painted.
    // --------------------------------------------------------

    if (
        terrain === "water"
    ) {

        console.warn(
            "Water is automatically assigned to ocean tiles."
        );

        return false;

    }


    // --------------------------------------------------------
    // Ocean cannot receive land terrain.
    // --------------------------------------------------------

    if (
        tile.owner === "ocean"
    ) {

        console.warn(
            "Cannot assign land terrain to an ocean tile."
        );

        return false;

    }


    const key =
        getTerrainKey(
            tile.col,
            tile.row
        );


    // --------------------------------------------------------
    // PLAINS = DEFAULT
    // --------------------------------------------------------
    //
    // Don't store the default terrain.
    //
    // --------------------------------------------------------

    if (
        terrain === DEFAULT_TERRAIN
    ) {

        delete terrainOverrides[key];

    }

    else {

        terrainOverrides[key] =
            terrain;

    }


    return true;

}


// ============================================================
// CLEAR TERRAIN
// ============================================================
//
// Removes a manual override.
//
// The tile returns to plains.
//
// ============================================================

export function clearTerrain(
    tile
) {

    if (
        !tile
    ) {

        return false;

    }


    if (
        !isValidCoordinate(
            tile.col,
            tile.row
        )
    ) {

        return false;

    }


    const key =
        getTerrainKey(
            tile.col,
            tile.row
        );


    delete terrainOverrides[key];


    return true;

}


// ============================================================
// APPLY TERRAIN DATA
// ============================================================
//
// Expected terrain.json:
//
// {
//     "default": "plains",
//     "tiles": {
//         "42,31": "forest"
//     }
// }
//
// No cols / rows are stored here.
//
// map.js remains the sole authority for map dimensions.
//
// ============================================================

export function applyTerrainData(
    data
) {

    // --------------------------------------------------------
    // Clear existing overrides.
    // --------------------------------------------------------

    for (
        const key
        of Object.keys(
            terrainOverrides
        )
    ) {

        delete terrainOverrides[key];

    }


    if (
        !data ||
        typeof data !== "object"
    ) {

        return;

    }


    // --------------------------------------------------------
    // DEFAULT
    // --------------------------------------------------------
    //
    // Currently plains is the only supported default.
    //
    // --------------------------------------------------------

    if (
        data.default &&
        isTerrainEditable(
            data.default
        )
    ) {

        if (
            data.default !== DEFAULT_TERRAIN
        ) {

            console.warn(

                `Terrain file specifies default "${data.default}". ` +
                `The current terrain system uses "${DEFAULT_TERRAIN}".`

            );

        }

    }


    // --------------------------------------------------------
    // OVERRIDES
    // --------------------------------------------------------

    if (
        !data.tiles ||
        typeof data.tiles !== "object"
    ) {

        return;

    }


    for (
        const [
            key,
            terrain
        ]
        of Object.entries(
            data.tiles
        )
    ) {

        // ----------------------------------------------------
        // Parse coordinate key
        // ----------------------------------------------------

        const parts =
            key.split(",");


        if (
            parts.length !== 2
        ) {

            console.warn(
                `Ignoring invalid terrain key: ${key}`
            );

            continue;

        }


        const col =
            Number(
                parts[0]
            );


        const row =
            Number(
                parts[1]
            );


        // ----------------------------------------------------
        // Validate coordinate
        // ----------------------------------------------------

        if (
            !isValidCoordinate(
                col,
                row
            )
        ) {

            console.warn(
                `Ignoring terrain outside map: ${key}`
            );

            continue;

        }


        // ----------------------------------------------------
        // Validate terrain
        // ----------------------------------------------------

        if (
            !isTerrainEditable(
                terrain
            )
        ) {

            console.warn(
                `Ignoring invalid terrain "${terrain}" at ${key}`
            );

            continue;

        }


        // ----------------------------------------------------
        // Don't store plains.
        // ----------------------------------------------------

        if (
            terrain === DEFAULT_TERRAIN
        ) {

            continue;

        }


        // ----------------------------------------------------
        // Don't store terrain on ocean.
        // ----------------------------------------------------

        const tile =
            tiles[
                row * COLS + col
            ];


        if (
            tile &&
            tile.owner === "ocean"
        ) {

            continue;

        }


        terrainOverrides[key] =
            terrain;

    }

}


// ============================================================
// LOAD TERRAIN.JSON
// ============================================================

export async function loadTerrain() {

    try {

        const response =
            await fetch(
                "data/terrain.json"
            );


        if (
            !response.ok
        ) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        applyTerrainData(
            data
        );


        console.log(

            `Terrain loaded: ${
                Object.keys(
                    terrainOverrides
                ).length
            } overrides`

        );


        return true;

    }

    catch (
        error
    ) {

        console.warn(

            "Could not load terrain.json. " +
            "Using default plains terrain.",

            error

        );


        // ----------------------------------------------------
        // Make sure we start clean.
        // ----------------------------------------------------

        for (
            const key
            of Object.keys(
                terrainOverrides
            )
        ) {

            delete terrainOverrides[key];

        }


        return false;

    }

}


// ============================================================
// GET OVERRIDES
// ============================================================
//
// Returns a copy rather than the actual object.
//
// ============================================================

export function getTerrainOverrides() {

    return {

        ...terrainOverrides

    };

}


// ============================================================
// COUNT OVERRIDES
// ============================================================

export function getTerrainOverrideCount() {

    return Object.keys(
        terrainOverrides
    ).length;

}


// ============================================================
// CREATE TERRAIN JSON
// ============================================================
//
// Produces the compact terrain.json format.
//
// ============================================================

export function createTerrainJSON() {

    return {

        default:
            DEFAULT_TERRAIN,

        tiles: {

            ...terrainOverrides

        }

    };

}
