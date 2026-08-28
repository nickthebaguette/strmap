// ============================================================
// TERRAIN.JS
// Shared terrain / physical geography system
// ============================================================
//
// terrain.json contains ONLY manual terrain overrides.
//
// Defaults:
//     ocean tile → water
//     land tile  → plains
//
// Example:
//
// {
//     "cols": 150,
//     "rows": 90,
//     "default": "plains",
//     "tiles": {
//         "42,31": "forest",
//         "43,31": "forest",
//         "50,34": "mountains"
//     }
// }
//
// ============================================================


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
// TERRAIN DATA
// ============================================================

let terrainData = {

    cols: 150,

    rows: 90,

    default: "plains",

    tiles: {}

};


// ============================================================
// INITIALIZE
// ============================================================

export function initializeTerrain(
    cols,
    rows
) {

    terrainData.cols =
        cols;

    terrainData.rows =
        rows;

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


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        terrainData = {

            cols:
                Number(data.cols) ||
                terrainData.cols,

            rows:
                Number(data.rows) ||
                terrainData.rows,

            default:
                data.default || "plains",

            tiles:
                data.tiles || {}

        };


        // ----------------------------------------------------
        // Clean invalid terrain overrides.
        // ----------------------------------------------------

        const cleanedTiles = {};


        for (
            const [key, terrain]
            of Object.entries(
                terrainData.tiles
            )
        ) {

            if (
                TERRAIN_TYPES[terrain] &&
                TERRAIN_TYPES[terrain].editable
            ) {

                cleanedTiles[key] =
                    terrain;

            }

        }


        terrainData.tiles =
            cleanedTiles;


        console.log(
            `Terrain loaded: ${
                Object.keys(
                    terrainData.tiles
                ).length
            } overrides`
        );


    }

    catch (error) {

        console.warn(
            "Could not load terrain.json. Using default terrain.",
            error
        );


        terrainData.tiles = {};

    }

}


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
// GET TERRAIN
// ============================================================
//
// mapTile is the actual tile object from map.js.
//
// This is important:
//
// We DON'T maintain a second copy of the map.
//
// map.js tells us whether the tile is ocean.
// terrain.js tells us what terrain the land tile has.
//
// ============================================================

export function getTerrain(
    col,
    row,
    mapTile
) {

    // --------------------------------------------------------
    // OCEAN
    // --------------------------------------------------------
    //
    // Ocean is controlled entirely by map.js.
    //
    // It cannot be overridden by terrain.json.
    //

    if (
        mapTile &&
        mapTile.owner === "ocean"
    ) {

        return "water";

    }


    // --------------------------------------------------------
    // MANUAL OVERRIDE
    // --------------------------------------------------------

    const key =
        getTerrainKey(
            col,
            row
        );


    const override =
        terrainData.tiles[key];


    if (
        override &&
        TERRAIN_TYPES[override]
    ) {

        return override;

    }


    // --------------------------------------------------------
    // DEFAULT LAND TERRAIN
    // --------------------------------------------------------

    return terrainData.default;

}


// ============================================================
// SET TERRAIN
// ============================================================
//
// Used by the editor.
//
// Examples:
//
// setTerrain(42, 31, "forest", tile);
//
// setTerrain(42, 31, "plains", tile);
//
// Setting plains removes the override.
//
// ============================================================

export function setTerrain(
    col,
    row,
    terrain,
    mapTile
) {

    // --------------------------------------------------------
    // Validate terrain
    // --------------------------------------------------------

    if (
        !TERRAIN_TYPES[terrain]
    ) {

        console.warn(
            `Unknown terrain type: ${terrain}`
        );

        return false;

    }


    // --------------------------------------------------------
    // Water is automatic.
    // --------------------------------------------------------

    if (
        terrain === "water"
    ) {

        return false;

    }


    // --------------------------------------------------------
    // Ocean cannot be painted.
    // --------------------------------------------------------

    if (
        mapTile &&
        mapTile.owner === "ocean"
    ) {

        return false;

    }


    const key =
        getTerrainKey(
            col,
            row
        );


    // --------------------------------------------------------
    // DEFAULT = REMOVE OVERRIDE
    // --------------------------------------------------------
    //
    // This is what keeps terrain.json compact.
    //
    // If the user paints a forest hex back to plains,
    // there is no reason to store "plains" in the JSON.
    //

    if (
        terrain === terrainData.default
    ) {

        delete terrainData.tiles[key];

    }

    else {

        terrainData.tiles[key] =
            terrain;

    }


    return true;

}


// ============================================================
// CLEAR TERRAIN OVERRIDE
// ============================================================

export function clearTerrain(
    col,
    row
) {

    const key =
        getTerrainKey(
            col,
            row
        );


    delete terrainData.tiles[key];

}


// ============================================================
// GET TERRAIN OVERRIDES
// ============================================================

export function getTerrainOverrides() {

    return terrainData.tiles;

}


// ============================================================
// CREATE TERRAIN JSON
// ============================================================
//
// This is what the editor will eventually use when the user
// presses "Download terrain.json".
//
// ============================================================

export function createTerrainJSON() {

    return {

        cols:
            terrainData.cols,

        rows:
            terrainData.rows,

        default:
            terrainData.default,

        tiles:
            {
                ...terrainData.tiles
            }

    };

}
