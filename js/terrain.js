// ============================================================
// TERRAIN.JS
// Terrain / physical geography system
// ============================================================
//
// terrain.json stores ONLY manual terrain overrides.
//
// Defaults:
//     ocean tile → water
//     land tile  → plains
//
// Example terrain.json:
//
// {
//     "cols": 150,
//     "rows": 90,
//     "default": "plains",
//     "tiles": {
//         "42,31": "forest",
//         "43,31": "forest"
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
// TERRAIN STATE
// ============================================================

let terrainData = {

    cols: 100,
    rows: 60,

    default: "plains",

    tiles: {}

};


// ============================================================
// LOAD TERRAIN
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
                Number(data.cols) || 100,

            rows:
                Number(data.rows) || 60,

            default:
                data.default || "plains",

            tiles:
                data.tiles || {}

        };


        console.log(
            "Terrain loaded:",
            Object.keys(
                terrainData.tiles
            ).length,
            "overrides"
        );


    }

    catch (error) {

        console.warn(
            "Could not load terrain.json. Using default terrain.",
            error
        );


        terrainData = {

            cols: 100,

            rows: 60,

            default: "plains",

            tiles: {}

        };

    }

}


// ============================================================
// INITIALIZE TERRAIN DIMENSIONS
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
// mapTile comes directly from map.js.
//
// Ocean is always water.
// Otherwise use the manual override.
// If no override exists, use plains.
//

export function getTerrain(
    col,
    row,
    mapTile
) {

    // --------------------------------------------------------
    // Ocean
    // --------------------------------------------------------

    if (
        mapTile &&
        mapTile.owner === "ocean"
    ) {

        return "water";

    }


    // --------------------------------------------------------
    // Manual override
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
    // Default
    // --------------------------------------------------------

    return terrainData.default;

}


// ============================================================
// SET TERRAIN
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
    // Water is controlled by map.js
    // --------------------------------------------------------

    if (
        terrain === "water"
    ) {

        return false;

    }


    // --------------------------------------------------------
    // Ocean cannot receive land terrain
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
    // Plains = default = remove override
    // --------------------------------------------------------

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
// CREATE TERRAIN JSON
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


// ============================================================
// GET TERRAIN OVERRIDES
// ============================================================

export function getTerrainOverrides() {

    return terrainData.tiles;

}
