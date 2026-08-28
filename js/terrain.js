// ============================================================
// TERRAIN.JS
// ============================================================
//
// Terrain is stored separately from map.json.
//
// map.json:
//     Political ownership
//
// terrain.json:
//     Manual terrain overrides
//
// Rules:
//
//     Ocean tile          -> water
//     Land without entry -> plains
//     Land with override -> specified terrain
//
// terrain.json therefore only needs to contain terrain that
// differs from the default.
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

    cols: 150,

    rows: 90,

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
                Number(data.cols) || 150,

            rows:
                Number(data.rows) || 90,

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


    } catch (error) {

        console.error(
            "Failed to load terrain.json:",
            error
        );


        // A missing terrain file should NOT break
        // the editor or game.

        terrainData = {

            cols: 150,

            rows: 90,

            default: "plains",

            tiles: {}

        };

    }

}


// ============================================================
// INITIALIZE TERRAIN
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

export function terrainKey(
    col,
    row
) {

    return `${col},${row}`;

}


// ============================================================
// GET TERRAIN
// ============================================================
//
// mapTile is the corresponding tile from map.js/editor map.
//
// Ocean is always water.
//
// Everything else defaults to plains unless manually
// overridden in terrain.json.
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
        terrainKey(
            col,
            row
        );


    if (
        terrainData.tiles[key] &&
        TERRAIN_TYPES[
            terrainData.tiles[key]
        ]
    ) {

        return terrainData.tiles[key];

    }


    // --------------------------------------------------------
    // Default
    // --------------------------------------------------------

    return terrainData.default;

}


// ============================================================
// SET TERRAIN
// ============================================================
//
// Setting plains removes the override because plains is the
// default.
//
// Water cannot be manually assigned.
//
// Ocean tiles cannot receive land terrain.
//

export function setTerrain(
    col,
    row,
    terrain,
    mapTile
) {

    if (
        !TERRAIN_TYPES[terrain]
    ) {

        console.warn(
            `Unknown terrain: ${terrain}`
        );

        return false;

    }


    // Water is controlled by map ownership.

    if (
        terrain === "water"
    ) {

        return false;

    }


    // Don't paint land terrain onto ocean.

    if (
        mapTile &&
        mapTile.owner === "ocean"
    ) {

        return false;

    }


    const key =
        terrainKey(
            col,
            row
        );


    // --------------------------------------------------------
    // Default terrain = no override
    // --------------------------------------------------------

    if (
        terrain === terrainData.default
    ) {

        delete terrainData.tiles[key];

    }


    // --------------------------------------------------------
    // Non-default terrain = override
    // --------------------------------------------------------

    else {

        terrainData.tiles[key] =
            terrain;

    }


    return true;

}


// ============================================================
// REMOVE TERRAIN OVERRIDE
// ============================================================

export function clearTerrain(
    col,
    row
) {

    const key =
        terrainKey(
            col,
            row
        );


    delete terrainData.tiles[key];

}


// ============================================================
// GET OVERRIDES
// ============================================================

export function getTerrainOverrides() {

    return terrainData.tiles;

}


// ============================================================
// GET TERRAIN DATA
// ============================================================
//
// Used when exporting terrain.json.
//

export function getTerrainData() {

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
// CREATE TERRAIN JSON
// ============================================================

export function createTerrainJSON() {

    return getTerrainData();

}
